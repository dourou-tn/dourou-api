// 1. connect to socket.
// 2. join the user to the specified room by auction-uiid.
const { Server } = require("socket.io");
const io = new Server({ cors: { origin: 'http://localhost:8080' } });
const CronJob = require('cron').CronJob;
const moment = require('moment');

io.listen(3001);
const engine = {
  io: io,
  socket: null,
  interval: null,
  auction_id: null,
  start_date: null,
  duration: null,
  stress_phase: false,
  end_auction: false,

  openRoomJob: function ({ auction_id, start_date, duration }) {
    const self = this;
    const startDate = moment(start_date)
    const end_date = startDate.clone().add(duration, 'minutes');
    console.log('duration', duration);
    console.log('startDate', startDate.clone().format());
    console.log('end_date', end_date.clone().format());

    return new CronJob(startDate, () => {
      self.interval = setInterval(() => {
        const time_remaining = end_date - moment();
        // 10 dernière seconds
        if (time_remaining < 10000) {
          console.log('stress_phase...');

          self.stress_phase = true;
          self.io.emit('tick:stress_phase', { auction_id });
          // end of the auction
          if (time_remaining <= 0) {
            self.end_auction = true;
            this.io.emit('auction-end', self.end_auction);
            clearInterval(self.interval);
          }

        } /** regular_phase */ else {
          self.io.emit('tick:regular', { auction_id });
        }
      }, 1000);
    });
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
    console.log('BID FROM user', this.stress_phase);
    this.io.emit('bid', { auction_id, current_price, last_bider, amount, stress_phase: this.stress_phase });
  }
}

exports.engine = engine;
