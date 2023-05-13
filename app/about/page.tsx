//
//  page.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { entries } from "@d-exclaimation/common";
import { page } from "@d-exclaimation/next";
import { timeline } from "~/common/manifest";
import Scrambled from "~/components/Scrambled";
import Timeline from "./timeline";

const scramble = {
  delay: 10_000,
  speed: 40,
};

const experiences = entries(timeline).flatMap(([key, value]) => {
  const [month, year] = key.split(" ");
  if (Array.isArray(value)) {
    return value.map((v) => ({
      date: { month, year },
      children: v,
    }));
  }
  return [
    {
      date: { month, year },
      children: value,
    },
  ];
});

const Page = page(() => {
  return (
    <div className="w-[90vw] min-h-screen h-max py-12 max-w-2xl bg-transparent flex flex-col items-start justify-start gap-4">
      <section className="w-full flex flex-col animate-fade-in">
        <Scrambled
          align="items-start"
          justify="justify-start"
          phrases={["About", "About"]}
          className="text-3xl font-bold"
          speed={scramble.speed}
          delay={scramble.delay}
        />
        <div className="w-full flex flex-col gap-4 my-4">
          <div className="w-full flex flex-col-reverse md:flex-row gap-4 items-center">
            <div className="flex flex-col gap-4">
              <p>
                I’m a computer science student and junior software engineer at
                Partly. I’m originally from Surabaya, East Java, Indonesia. I
                owe much of my career to the Web and Open Source.
              </p>
              <p>
                I started my programming journey during the pandemic in 2020. I
                took advantage of the free time I got from lockdown to learn
                programming and web development.
              </p>
            </div>
            <img
              className="w-24 h-24 lg:w-36 lg:h-36 object-cover rounded-full hover:grayscale-0 grayscale"
              src="https://avatars.githubusercontent.com/u/70748917?v=4"
            />
          </div>
          <p>
            After realising that I enjoy software engineering, I decided to
            study computer science at University of Canterbury and relocated to
            Christchurch, NZ.
          </p>
          <p>
            On the side, I started contributing to open source projects like
            GraphQL, GraphQLSwift, and even made some of my own like Pioneer,
            Seraph and more. Those projects helped me learn a lot about many
            aspect of programming and be a overall better engineer.
          </p>
          <p>
            I’m currently working at Partly, New Zealand's fastest growing
            startup. My role is to help build and maintain the core seller
            experience, PartsPal, which is built with React, TypeScript,
            Node.js, and GraphQL.
          </p>
        </div>
      </section>

      <section className="w-full flex flex-col animate-fade-in">
        <Scrambled
          align="items-start"
          justify="justify-start"
          phrases={["Experiences", "Timeline"]}
          className="text-2xl font-bold"
          speed={scramble.speed}
          delay={scramble.delay}
        />

        <div className="flex w-full gap-4 flex-col-reverse my-4">
          {experiences.map(({ date, children }) => (
            <Timeline key={`${date.month}-${date.year}`} date={date}>
              {children}
            </Timeline>
          ))}
        </div>
      </section>
    </div>
  );
});

export const runtime = "edge";

export default Page;
