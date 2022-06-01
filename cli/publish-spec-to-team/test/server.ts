/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import assert from "assert";
import express from "express";
import multer from "multer";
import pc from "picocolors";
import { AssertFileData, AssertRequest } from "./types.js";

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
  "/completions",
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
    const token = req.headers.authorization!;

    const encodedAssertData = req.headers["assert-data"]!;
    assert(!Array.isArray(encodedAssertData));

    const { files, ...rest }: AssertRequest = JSON.parse(
      Buffer.from(encodedAssertData, "base64").toString("utf-8")
    );
    assert(req.files && !Array.isArray(req.files));

    const errors: string[] = [];

    // expect ...rest to be exactly equal to body;
    if (!deepEqual(rest, { token, ...req.body })) {
      errors.push("Received data and assert do not match");
    }

    if (files) {
      // expect files content to be exactly the same as the passed in files
      const specFieldIndexes = ["tsSpec", "jsSpec"] as (keyof typeof files)[];
      for (const specFieldIndex of specFieldIndexes) {
        const assertFileData: AssertFileData | undefined = files[specFieldIndex];
        if (assertFileData) {
          const { name, content } = assertFileData;
          const multerFile = req.files[specFieldIndex][0] as Express.Multer.File;
          if (name && name !== multerFile.originalname) {
            errors.push(
              `Expected filename "${multerFile.originalname}" for "${specFieldIndex}" and instead received "${name}"`
            );
          }
          if (content && !multerFile.buffer.equals(Buffer.from(content))) {
            errors.push(
              `Received content was different from the expected one for "${specFieldIndex}`
            );
          }
        }
      }
    }

    if (errors.length) {
      return res.status(400).json({ error: errors.join("\n") });
    }

    return res.status(200).json({ name: req.body.name, namespace: req.body.team || "default" });
  }
);

const server = app.listen(PORT, () => {
  console.log(pc.yellow(`Started listening on ${PORT}`));
});

process.on("SIGTERM", () => {
  console.log(pc.yellow(`Stopped listening on ${PORT}`));
  server.close();
});
