/** 台灣中文（zh-TW）的伺服器端字典：與 dict/en 同樣的分區與型別。 */
import type { Dict } from "../en";
import { common } from "./common";
import { chrome } from "./chrome";
import { place } from "./place";
import { pages } from "./pages";
import { views } from "./views";
import { insight } from "./insight";
import { modules } from "./modules";
import { content } from "./content";
import { alerts } from "./alerts";
import { account } from "./account";
import { wire } from "./wire";

export const zhTW: Dict = { common, chrome, place, pages, views, modules, content, alerts, account, wire, insight };
