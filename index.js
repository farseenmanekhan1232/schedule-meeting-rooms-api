const express = require("express");

const app = express();

const building = {
  openinig: 9,
  closing: 19,
  meetingRooms: {
    1: {
      dates: {
        20230911: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: true, tv: true, capacity: 12 },
      slotsize: 20,
    },
    2: {
      dates: {
        20230911: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: false, tv: true, capacity: 10 },
      slotsize: 20,
    },
    3: {
      dates: {
        20230911: {
          slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          users: {},
        },
      },
      amenities: { ac: true, tv: false, capacity: 10 },
      slotsize: 20,
    },
    4: {
      dates: {
        20230911: {
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
  res.send(building);
});

app.get("/meetingrooms/:mid", (req, res) => {
  const mid = req.params.mid;
  res.send(building.meetingRooms[mid]);
});

app.get("/meetingrooms/:mid/:date", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;

  if (date in building.meetingRooms[mid].dates) {
    res.send(building.meetingRooms[mid].dates[date]);
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

    res.send(building.meetingRooms[mid].dates[date]);
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
    console.log("hit");
    if (slots[i]) {
      isAvailable = false;
      break;
    }
  }

  if (isAvailable) {
    res.send({ message: "available" });
  }
  res.send({ message: "not available" });
});

app.post("/meetingrooms/:mid/:date", (req, res) => {
  const mid = req.params.mid;
  const date = req.params.date;

  const data = req.query;
  console.log(data);
  const uid = data.uid;

  let [opening, closing] = req.params.slot.split(":");
  closing = closing - 1;
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
    console.log("hit");
    if (slots[i]) {
      isAvailable = false;
      break;
    }
  }

  if (isAvailable) {
    if (date in building.meetingRooms[mid].dates) {
      for (let i = opening; i <= closing; i++) {
        building.meetingRooms[mid].dates[date].slots[i] = 1;
      }
      building.meetingRooms[mid].dates[date].users[uid].push([
        opening,
        closing + 1,
      ]);
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

      for (let i = opening; i <= closing; i++) {
        building.meetingRooms[mid].dates[date].slots[i] = 1;
      }
      building.meetingRooms[mid].dates[date].users[uid] = [
        [opening, closing + 1],
      ];
    }

    res.status(200).send(building.meetingRooms[mid].dates[date]);
  } else {
    res.send({ message: "not available" });
  }
});

app.listen(3000, () => {
  console.log("listening ");
});
