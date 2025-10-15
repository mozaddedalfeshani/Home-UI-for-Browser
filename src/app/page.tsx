import DigitalClock from "@/components/Home/ClockZone/Clock";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full">
      <div className="flex flex-row ">
        {/* Left side  */}
        <div>
          <DigitalClock />
        </div>
        {/* Right side */}
        <div>

        </div>
      </div>
    </div>
  );
}
