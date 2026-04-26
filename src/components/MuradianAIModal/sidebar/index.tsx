"use client";

import { SidebarTop } from "./sidebar-top";
import { SidebarBody } from "./sidebar-body";
import { SidebarBottom } from "./sidebar-bottom";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col hidden lg:flex">
      <SidebarTop />
      <SidebarBody />
      <SidebarBottom />
    </aside>
  );
}
