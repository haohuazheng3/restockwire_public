/** 한국어 서버 문구. 영어(dict/en)와 같은 모양이고, 타입 검사가 빠진 키를 막아요. */
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

export const ko: Dict = { common, chrome, place, pages, views, modules, content, alerts, account, wire, insight };
