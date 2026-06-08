import type { ComponentType, SVGProps } from "react";

import Avatar01 from "./avatar-01.svg";
import Avatar02 from "./avatar-02.svg";
import Avatar03 from "./avatar-03.svg";
import Avatar04 from "./avatar-04.svg";
import Avatar05 from "./avatar-05.svg";
import Avatar06 from "./avatar-06.svg";
import Avatar07 from "./avatar-07.svg";
import Avatar08 from "./avatar-08.svg";
import Avatar09 from "./avatar-09.svg";
import Avatar10 from "./avatar-10.svg";
import Avatar11 from "./avatar-11.svg";
import Avatar12 from "./avatar-12.svg";
import Avatar13 from "./avatar-13.svg";
import Avatar14 from "./avatar-14.svg";
import Avatar15 from "./avatar-15.svg";
import Avatar16 from "./avatar-16.svg";
import Avatar17 from "./avatar-17.svg";
import Avatar18 from "./avatar-18.svg";
import Avatar19 from "./avatar-19.svg";
import Avatar20 from "./avatar-20.svg";
import Avatar21 from "./avatar-21.svg";
import Avatar22 from "./avatar-22.svg";
import Avatar23 from "./avatar-23.svg";
import Avatar24 from "./avatar-24.svg";

export {
  Avatar01,
  Avatar02,
  Avatar03,
  Avatar04,
  Avatar05,
  Avatar06,
  Avatar07,
  Avatar08,
  Avatar09,
  Avatar10,
  Avatar11,
  Avatar12,
  Avatar13,
  Avatar14,
  Avatar15,
  Avatar16,
  Avatar17,
  Avatar18,
  Avatar19,
  Avatar20,
  Avatar21,
  Avatar22,
  Avatar23,
  Avatar24,
};

export type AvatarComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type AvatarEntry = {
  id: number;
  Component: AvatarComponent;
  label: string;
};

export const avatars: AvatarEntry[] = [
  {
    id: 1,
    Component: Avatar01,
    label: "woman · messy bun · round glasses · hoops",
  },
  { id: 2, Component: Avatar02, label: "guy · bucket hat · gold chain" },
  {
    id: 3,
    Component: Avatar03,
    label: "woman · curtain bangs · big gold hoops",
  },
  { id: 4, Component: Avatar04, label: "guy · wolf-cut mullet · ear stud" },
  { id: 5, Component: Avatar05, label: "guy · faded top-knot · septum ring" },
  { id: 6, Component: Avatar06, label: "woman · sleek bob · red glasses" },
  { id: 7, Component: Avatar07, label: "man · top-knot · beard · ear hoop" },
  { id: 8, Component: Avatar08, label: "woman · pixie cut · hoop" },
  { id: 9, Component: Avatar09, label: "woman · space buns · pink streak" },
  { id: 10, Component: Avatar10, label: "man · buzz cut · black shades" },
  { id: 11, Component: Avatar11, label: "woman · twin braids · teal beanie" },
  { id: 12, Component: Avatar12, label: "woman · dark waves · bold lips" },
  { id: 13, Component: Avatar13, label: "guy · slick undercut · neck tattoo" },
  {
    id: 14,
    Component: Avatar14,
    label: "woman · polka bandana · big hoops",
  },
  {
    id: 15,
    Component: Avatar15,
    label: "guy · tinted glasses · earbuds",
  },
  { id: 16, Component: Avatar16, label: "man · short beard · man bun" },
  { id: 17, Component: Avatar17, label: "woman · long straight hair · studs" },
  { id: 18, Component: Avatar18, label: "man · side part · glasses" },
  {
    id: 19,
    Component: Avatar19,
    label: "east-asian woman · blunt bob · streak",
  },
  { id: 20, Component: Avatar20, label: "man · middle-part fringe · ear stud" },
  { id: 21, Component: Avatar21, label: "woman in hijab · glasses" },
  { id: 22, Component: Avatar22, label: "guy · over-ear headphones" },
  { id: 23, Component: Avatar23, label: "guy · backwards cap · hoop earring" },
  {
    id: 24,
    Component: Avatar24,
    label: "barista woman · high ponytail · apron",
  },
];
