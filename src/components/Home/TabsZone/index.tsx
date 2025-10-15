import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";

const TabsZone = () => {
  return (
    <div>
      <Card>
        <div className="w-full bg-white h-10 flex flex-row justify-end items-center px-2">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none">
              <g clipPath="url(#clip0_4418_9827)">
                <path
                  d="M8 12H16"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 16V8"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_4418_9827">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TabsZone;
