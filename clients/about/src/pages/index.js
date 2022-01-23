import * as React from "react";
import Layout from "../components/layout";

import Hero from "../components/hero/hero";
import { Heading, Subheading } from "../components/typography/headings";
import CloudStorageImage from "../images/cloud-storage-secondary.jpg";
import CreateNotesImage from "../images/create-notes-secondary.jpg";
import KanbanBoardImage from "../images/kanban-board-secondary.jpg";
import HomeImage from "../images/home-img.png";
import SignupButton from "../components/signupButton";

export default function Index() {
  return (
    <Layout>
      <Hero
        backgroundImage="/1440-board-img-1.jpg"
        showSignup
        // subtitle="Use uploaded photos of your whiteboarding sessions to organize
        //     brainstorms, manage projects and boost efficiency."
        subtitle="Use whiteboard photos to manage projects, organize brainstorms and boost efficiency."
        // title="Whiteboard notes, meet the cloud."
        // title="Organization tools for whiteboard lovers"
        title="Extraordinary tools for ordinary whiteboards"
      />
      <div id="about" className="py-20 lg:py-40">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold container mx-auto max-w-5xl px-5 text-center mb-20">
          {/* Everything you need to start owning your planning sessions */}
          {/* Turn your whiteboard into a productivity workhorse */}
          {/* Everything you need to turn your whiteboard into a productivity
          workhorse */}
          {/* Tools for any whiteboarder */}
          {/* Tools for whiteboard lovers */}
          {/* Elevate your whiteboard */}
          {/* Utilities for a simpler life */}
          {/* A whiteboard's best friend */}
          Turn any whiteboard into a productivity workhorse
        </div>
        <div className="grid lg:grid-cols-3 xl:gap-20 container mx-auto">
          <div className="text-center my-10 px-5 md:px-5">
            <div className="mb-5">
              <img
                src={CreateNotesImage}
                alt="notes forever"
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <Heading>Capture Notes</Heading>
            <Subheading>
              <div className="md:max-w-md md:mx-auto">
                {/* Capture your boards and access them from any device */}
                {/* Capture your hand-written notes as individual cards that will
                outlast any dry eraser */}
                Transform written notes into individual cards that can't be
                simply dry-erased
                {/* Transform hand-written notes to a digital format that won't go
                away with a dry erase */}
              </div>
            </Subheading>
          </div>
          <div className="text-center my-10 px-5 md:px-5">
            <div className="mb-5">
              <img
                src={KanbanBoardImage}
                alt="kanban board"
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <Heading>Manage Projects</Heading>
            <Subheading>
              <div className="md:max-w-md md:mx-auto">
                {/* Capture your boards and access them from any device */}
                Track and organize cards on a minimalist Kanban board with
                customizable projects
              </div>
            </Subheading>
          </div>
          <div className="text-center my-10 px-5 md:px-5">
            <div className="mb-5">
              <img
                src={CloudStorageImage}
                alt="cloud storage"
                className="w-full max-w-xs mx-auto"
              />
            </div>
            <Heading>Access Anywhere</Heading>
            <Subheading>
              <div className="md:max-w-md md:mx-auto">
                {/* Capture your boards and access them from any device */}
                Manage your projects and photos from wherever life takes you
              </div>
            </Subheading>
          </div>
        </div>
      </div>
      <div className="bg-blue-900 text-white py-40 lg:py-60">
        <div className="grid grid-cols-1 lg:grid-cols-6 container mx-auto">
          <div className="px-10 lg:col-span-3 xl:col-span-4 flex flex-col justify-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-center lg:text-left">
              {/* Finally, a home for whiteboard photos */}
              {/* All your whiteboard photos in one place */}Finally. A home for
              whiteboard photos.
            </div>

            <Subheading className="lg:max-w-sm text-center lg:text-left mb-20">
              {/* With a central hub, you won't need to look far next time you
            need your notes. */}
              {/* Having everything under one roof means your notes are always safe
              and sound when you need them. */}
              {/* Having everything under one roof means you always know where to
              find your notes when you need them. */}
              {/* Having everything under one roof means your notes are always just
              a few seconds away. Never lose another great idea. */}
              Gone are the days of cluttered photo libraries. Bring your
              whiteboard pictures together so you know exactly where to look for
              that last great idea.
              {/* Having everything
              under one roof means you won't need to look very far next time you
              need your notes. */}
            </Subheading>
          </div>
          <div className="px-10 lg:col-span-3 xl:col-span-2">
            <img
              src={HomeImage}
              alt="home"
              className="w-full mx-auto max-w-md"
            />
          </div>
        </div>
      </div>
      <div className="border-t-8 border-yellow-500" />
      <div className="px-5 py-80 lg:px-20 text-center">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
          Ready to get started?
        </div>
        <div className="lg:text-xl">Empower your whiteboard today.</div>
        <div className="lg:text-xl mb-10">Sign up for free.</div>
        <div>
          <SignupButton text="Let's go" />
        </div>
      </div>
    </Layout>
  );
}
