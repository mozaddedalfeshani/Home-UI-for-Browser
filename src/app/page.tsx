import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full ">
      <div className="flex flex-row min-h-screen p-6">
        {/* Left side  */}
        <div className="w-3/4">
          <DigitalClock />
          <TabsZone />
        </div>
        {/* Right side */}
        <div className="w-1/4 bg-blue-950">This is right side</div>
      </div>
    </div>
  );
}
