// 1. connect to socket.
// 2. join the user to the specified room by auction-uiid.
const { Server } = require("socket.io");
const io = new Server({ cors: { origin: 'http://localhost:8080' } });
const moment = require('moment');

io.listen(3001);
const engine = {
  // engine
  io: io,
  socket: null,
  job: null,
  interval: null,

  // data
  auction_id: null,
  start_date: null,
  end_date: null,
  duration: null,
  job_uiid: null,

  // engine states
  regular_phase: true,
  stress_phase: false,
  stress_threshold: 10000,

  /**
   * ✌️ The auction start now!
   * 
   * 1. update job state:
   *  - [id=2]on:waiting -> [id=3]on:running.
   * 2. launch the setInterval (interval = 1000).
   * 3. every second based on time_remaining:
   *  - regular_phase   emit @tick:regular_phase
   *  - stress_phase    emit @tick:stress_phase
   */
  startRoom: function ({ auction_id, start_date, end_date, duration }) {
    this.auction_id = auction_id;
    this.start_date = start_date;
    this.end_date = end_date;
    this.duration = duration;

    console.log(`✌️ Auction ${this.auction_id} with duration ${this.duration} started at ${this.start_date} and will end at ${this.end_date}`);

    this.interval = setInterval(() => {
      const now = moment();
      const time_remaining = this.end_date - now;

      console.log('now', now);
      console.log('time_remaining', time_remaining);

      // end of the auction
      if (time_remaining <= 0) {
        console.log('[tick]:auction_end');
        this.io.emit('tick:auction_end');
        clearInterval(this.interval);
        // TODO: need to stop the auction process.
        // this.job.stop();
        console.log('🤖 Job [%s] for auction %s ended as %s', this.job_uiid, this.auction_id, now.clone().format('YYYY-MM-DD HH:mm:ss'));
      }

      // regular_phase
      if (time_remaining > this.stress_threshold) {
        console.log('[tick]:regular_phase');
        this.io.emit('tick:regular_phase');
      }

      // stress_phase
      if (time_remaining <= this.stress_threshold) {
        console.log('[tick]:stress_phase');
        this.stress_phase = true;
        this.io.emit('tick:stress_phase');
      }

    }, 1000);

  },

  init () {
    const self = this;
    try {
      this.io.on('connection', (socket) => {
        console.log(`socket connected: ${socket.id}`);
        self.socket = socket;
      });
    } catch (error) {
      reject(error);
    }
  },
  bid({ auction_id, current_price, last_bider, amount }) {
    // dispatch the bid to all sockets.
    if (this.stress_phase) {
      this.end_date = moment().add(10, 's'); // add 10sec
    }
    this.io.emit('bid', { auction_id, current_price, last_bider, amount, stress_phase: this.stress_phase });
  }
}

exports.engine = engine;
