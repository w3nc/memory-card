import jesse from './assets/characters/jesse-pinkman.jpg';
import walt from './assets/characters/walter-white.jpg';
import gus from './assets/characters/gus-fring.jpg';
import saul from './assets/characters/saul-goodman.jpg';
import mike from './assets/characters/mike-erm.jpg';
import hank from "./assets/characters/hank.jpg";
import flynn from "./assets/characters/flynn.jpg";
import combo from "./assets/characters/combo.jpg";
import skinny from "./assets/characters/skinny.jpg";
import badger from "./assets/characters/badger.jpg";

// The first five use art cropped from your screenshots.
// The other five have no image yet: they fall back to an emoji.
// To add art, import an image here and put it in `src` (see Card.jsx).
const characters = [
  { id: "jesse", name: "Jesse", src: jesse },
  { id: "walt", name: "Heisenberg", src: walt },
  { id: "gus", name: "Gus", src: gus },
  { id: "saul", name: "Saul", src: saul },
  { id: "mike", name: "Mike", src: mike },
  { id: "hank", name: "Hank", src: hank },
  { id: "flynn", name: "Flynn", src: flynn },
  { id: "combo", name: "Combo", src: combo },
  { id: "skinny", name: "SkinnyPete", src: skinny },
  { id: "badger", name: "Badger", src: badger },
];

export default characters;
