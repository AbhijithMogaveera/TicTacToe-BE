import {
  wsConnectionStateChangeInterceptors,
  wsIncommingMessageInterceptors,
  wsOutGoingMessageInterceptors,
} from "..";
import { BufferLike } from "../wrapper/WebSocket";


if (true) {
  wsConnectionStateChangeInterceptors.push(async (ws, payload, isConnected) => {
    if (isConnected) {
      console.log("\n", `connect :: 🟢 ${payload.user_name}`);
    } else {
      console.log("\n", `connect :: 🛑 ${payload.user_name}`);
    }
  });

  wsIncommingMessageInterceptors.push(async (ws, payload, message) => {
    console.log(
      "\n",
      "------------------------------",
      "\n",
      "message ",
      " <<< ",
      payload.user_name,
      "\n",
      tryParse(message)
    );
  });

  wsOutGoingMessageInterceptors.push(async (ws, message, user_name) => {
    console.log(
      "\n",
      "------------------------------",
      "\n",
      "message ",
      ` >>> `,
      user_name,
      "\n",
      tryParse(message)
    );
  });

  function tryParse(str: BufferLike) {
    try {
      return JSON.parse(str.toString());
    } catch (error) {
      return str.toString();
    }
  }
}
