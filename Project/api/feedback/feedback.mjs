import feedback from "./feedbackSchema.mjs";
import * as fs from "fs";
import { parse } from "json2csv";
import { CronJob } from "cron";

/* 
  Method for creating feedback through a rating from 1 - 10 and feedback information in the form of text. 
*/
async function feedbackCreation(req, res) {
  const { body } = req;
  const { rating = 1, feedbackText = "" } = body;
  const feedbackInfo = await feedback.create({
    rating: rating,
    feedbackText: feedbackText,
  });
  await feedbackInfo.save();
  res.send("Feedback sent");
  return feedbackInfo;
}

/* 
  Method for querying for feedback with a rating that is less than 6. 
*/

async function findFeedback(req, res) {
  let query = { rating: { $lt: 6 } };
  let feedbackDocs = await feedback.find(query);

  if (feedbackDocs.length == 0) {
    return "No documents found";
  }
  res.send(feedbackDocs);
  dataToCSV(feedbackDocs);
  return feedbackDocs;
}

/* 
Method for querying for feedback with a rating that is less than 6 and putting it into a csv file (destination.csv) using json2csv module. The csv file has three coloumns: id, rating, and feedback with their respective data. Cron module is used to repeat this task at the end of each day. */

async function dataToCSV(info) {
  let job = new CronJob(
    "* * * * * *",
    function () {
      console.log(`Printing this message each second`);
      let arr = [];

      for (let i = 0; i < info.length; i++) {
        let data = {
          id: "",
          rating: 0,
          feedback: "",
        };
        data.id = info[i]._id.valueOf();
        data.rating = info[i].rating;
        data.feedback = info[i].feedbackText;
        console.log(data);
        arr.push(data);
      }
      console.log(arr);

      let fieldsNew = ["id", "rating", "feedback"];
      const csv = parse(arr);
      console.log(csv);

      let csvNew = parse(arr, { fields: fieldsNew });
      fs.writeFile("./destination.csv", csvNew, function (err, result) {
        if (err) console.log("error", err);
      });
    },
    null,
    true,
    "America/Los_Angeles"
  );
}

/* Method that uses the id of the feedback to update the text content or rating of the feedback */

async function updateField(req, res) {
  const { body } = req;
  const { rating, feedbackText, oid } = body;
  if (oid.length == 0) {
    res.send("No object id provided");
    return "No object id provided";
  }
  let document = await feedback.find({ _id: oid });
  if (
    document[0].rating > 0 &&
    document[0].rating <= 10 &&
    document[0].rating != rating
  ) {
    document[0].rating = rating;
  } else {
    res.send("Can't update field");
  }

  if (feedbackText.length != 0) {
    document[0].feedbackText = feedbackText;
  } else {
    res.send("Can't update field");
  }
  await document[0].save();
  res.send(document[0]);
}

export { feedbackCreation, findFeedback, updateField };
