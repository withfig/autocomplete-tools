import assert from "assert";
import express from "express";
import multer from "multer";
import { CheckData } from "./types.js";
import pc from "picocolors"

const PORT = process.env.TEST_PORT || 3005;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.urlencoded({ extended: false }));

function isObject(object: any) {
  return object != null && typeof object === "object";
}
function deepEqual(object1: Record<string, any>, object2: Record<string, any>) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
      return false;
    }
  }
  return true;
}

app.put(
  "/cdn",
  upload.fields([
    {
      name: "tsSpec",
      maxCount: 1,
    },
    {
      name: "jsSpec",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const [_, encodedData] = req.headers.authorization!.split(" ");
    const { files, ...rest }: CheckData = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    );
    assert(req.files && !Array.isArray(req.files));

    // expect ...rest to be exactly equal to body;
    if (!deepEqual(rest, req.body)) {
      return res.status(400).send("Received data and checkData do not match");
    }
    // expect files content to be exactly the same as the passed in files
    if (req.files.tsSpec[0].buffer.equals(Buffer.from(files.ts))) {
      return res.status(400).send("Received TS spec and expected TS spec do not match");
    }
    if (req.files.jsSpec[0].buffer.equals(Buffer.from(files.js))) {
      return res.status(400).send("Received JS spec and expected JS spec do not match");
    }

    return res.sendStatus(200);
  }
);

const server = app.listen(PORT, () => {
  console.log(pc.yellow(`Started listening on ${PORT}`));
});

server.on('close', () => {
  console.log(pc.yellow(`Stopped listening on ${PORT}`));
});
