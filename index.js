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
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      },
      amenities: { ac: true, tv: true, capacity: 12 },
      slotsize: 20,
    },
    2: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      },
      amenities: { ac: false, tv: true, capacity: 10 },
      slotsize: 20,
    },
    3: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      },
      amenities: { ac: true, tv: false, capacity: 10 },
      slotsize: 20,
    },
    4: {
      dates: {
        20230611: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      },
      amenities: { ac: true, tv: true, capacity: 7 },
      slotsize: 20,
    },
  },
  users: {},
};

app.get("/meetingrooms", (req, res) => {
  res.status(200).send(building);
});

app.get("/meetingrooms/user/:uid", (req, res) => {
  const uid = req.params.uid;
  res.send(building.users[uid]);
});

app.get("/meetingrooms/:date/:slot", (req, res) => {
  let mids = [];

  let [opening, closing] = req.params.slot.split(":");
  closing = closing - 1;
  const date = req.params.date;

  Object.keys(building.meetingRooms).forEach((mid) => {
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
    for (let i = parseInt(opening); i <= closing; i++) {
      if (slots[i] == 1) {
        isAvailable = false;
        break;
      }
    }

    if (isAvailable) {
      mids.push(mid);
    }
  });

  res.send({ mids: mids });
});

app.get("/meetingrooms/meetingroom/:mid", (req, res) => {
  const mid = req.params.mid;
  res.status(200).send(building.meetingRooms[mid]);
});

app.get("/meetingrooms/meetingroom/:mid/:date", (req, res) => {
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

app.get("/meetingrooms/meetingroom/:mid/:date/:slot", (req, res) => {
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

app.post("/meetingrooms/meetingroom/:mid/:date", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;

  const data = req.body;
  console.log(data);

  let [opening, closing] = data.slots.split(":");
  let uid = data.uid;
  let title = data.title;

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
    if (!(uid in building.users)) {
      building.users[uid] = {};
      building.users[uid][date] = {};
      building.users[uid][date].meetings = {};
    }

    for (let i = opening; i <= closing; i++) {
      building.meetingRooms[mid].dates[date].slots[i] = 1;
    }

    const id = uuidv4();
    if (!(date in building.users[uid])) {
      building.users[uid][date] = {
        meetings: {},
      };
    }
    building.users[uid][date].meetings[id] = {
      title: title,
      slots: [parseInt(opening), closing + 1],
      mid: mid,
    };

    res.status(200).send(building);
  } else {
    res.status(200).send({ message: "not available" });
  }
});

app.delete("/meetingrooms/meetingroom", (req, res) => {
  const data = req.body;
  console.log(data);
  const uid = data.uid;
  const meetingid = data.meetingid;
  const date = data.date;
  console.log(building.users[uid]);

  const [opening, closing] =
    building.users[uid][date].meetings[meetingid].slots;
  const mid = building.users[uid][date].meetings[meetingid].mid;

  for (let i = opening; i < closing; i++) {
    building.meetingRooms[mid].dates[date].slots[i] = 0;
  }
  delete building.users[uid][date].meetings[meetingid];

  res.status(200).send({ message: "meeting removed" });
});

app.listen(3000, () => {
  console.log("listening ");
});
