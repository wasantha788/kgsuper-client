import { createBrowserRouter } from "react-router";
import Root from "../Root/Root";
import Home from "../pages/chat/ChatHome";
import Send from "../pages/chat/Send";
import Receive from "../pages/chat/Receive";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        path: "/Home2",
        Component: Home,
      },
      {
        path: "/send",
        Component: Send,
      },
      {
        path: "/receive",
        Component: Receive,
      },
    ],
  },
]);
