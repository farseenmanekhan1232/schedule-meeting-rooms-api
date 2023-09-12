const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const building = {
  opening: 9,
  closing: 19,
  meetingRooms: {
    1: {
      dates: {
        20230611: {
          slots: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: true, tv: true, capacity: 12 },
      slotsize: 20,
    },
    2: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: false, tv: true, capacity: 10 },
      slotsize: 20,
    },
    3: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: true, tv: false, capacity: 10 },
      slotsize: 20,
    },
    4: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: true, tv: true, capacity: 7 },
      slotsize: 20,
    },
  },
};

app.get("/meetingrooms", (req, res) => {
  res.status(200).send(building);
});

app.get("/meetingrooms/:mid", (req, res) => {
  const mid = req.params.mid;
  res.status(200).send(building.meetingRooms[mid]);
});

app.get("/meetingrooms/:mid/:date", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;

  if (date in building.meetingRooms[mid].dates) {
    res.status(200).send(building.meetingRooms[mid].dates[date]);
  } else {
    const slots = [];
    const slotSize = building.meetingRooms[mid].slotsize;

    for (let i = 0; i < slotSize; i++) {
      slots.push(0);
    }
    building.meetingRooms[mid].dates[date] = {
      slots: slots,
      users: {},
    };

    res.status(200).send(building.meetingRooms[mid].dates[date]);
  }
});

app.get("/meetingrooms/:mid/:date/:slot", (req, res) => {
  let [opening, closing] = req.params.slot.split(":");
  closing = closing - 1;
  const mid = req.params.mid;
  const date = req.params.date;
  let isAvailable = true;

  if (!(date in building.meetingRooms[mid].dates)) {
    const slots = [];
    const slotSize = building.meetingRooms[mid].slotsize;

    for (let i = 0; i < slotSize - 1; i++) {
      slots.push(0);
    }
    building.meetingRooms[mid].dates[date] = {
      slots: slots,
      users: {},
    };
  }

  const slots = building.meetingRooms[mid].dates[date].slots;
  for (let i = opening; i <= closing; i++) {
    if (slots[i]) {
      isAvailable = false;
      break;
    }
  }

  if (isAvailable) {
    res.status(200).send({ message: "available" });
  }
  res.status(200).send({ message: "not available" });
});

app.post("/meetingrooms/:mid/:date", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;

  const data = req.body;
  console.log(data);

  let [opening, closing] = data.slots.split(":");
  let uid = data.uid;

  closing = closing - 1;
  let isAvailable = true;

  console.log(date in building.meetingRooms[mid].dates);

  if (!(date in building.meetingRooms[mid].dates)) {
    const slots = [];
    const slotSize = building.meetingRooms[mid].slotsize;

    for (let i = 0; i < slotSize - 1; i++) {
      slots.push(0);
    }
    building.meetingRooms[mid].dates[date] = {
      slots: slots,
      users: {},
    };
  }

  const slots = building.meetingRooms[mid].dates[date].slots;
  for (let i = opening; i <= closing; i++) {
    if (slots[i]) {
      isAvailable = false;
      break;
    }
  }

  console.log(uid in building.meetingRooms[mid].dates[date].users);

  if (isAvailable) {
    if (!(uid in building.meetingRooms[mid].dates[date].users)) {
      building.meetingRooms[mid].dates[date].users[uid] = {
        meetings: {},
      };
    }

    for (let i = opening; i <= closing; i++) {
      building.meetingRooms[mid].dates[date].slots[i] = 1;
    }

    const id = uuidv4();

    building.meetingRooms[mid].dates[date].users[uid].meetings[id] = [
      parseInt(opening),
      closing + 1,
    ];

    res.status(200).send(building);
  } else {
    res.status(200).send({ message: "not available" });
  }
});

app.delete("/meetingrooms/:mid/:date/:uid/:meetingid", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;
  const uid = req.params.uid;
  const meetingid = req.params.meetingid;

  const [opening, closing] =
    building.meetingRooms[mid].dates[date].users[uid].meetings[meetingid];

  for (let i = opening; i <= closing; i++) {
    building.meetingRooms[mid].dates[date].slots[i] = 0;
  }
  delete building.meetingRooms[mid].dates[date].users[uid].meetings[meetingid];
  res.status(200).send(building.meetingRooms.mid.dates.date.users);
});

app.listen(3000, () => {
  console.log("listening ");
});
