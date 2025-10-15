import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full p-6">
      <div className="flex flex-row ">
        {/* Left side  */}
        <div>
          <DigitalClock />
          <TabsZone />
        </div>
        {/* Right side */}
        <div></div>
      </div>
    </div>
  );
}
