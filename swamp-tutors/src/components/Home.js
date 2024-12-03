import React from "react";

const Home = () => {
  return (
    <div>
      <header id="header" className="group">
        <nav className="fixed overflow-hidden z-20 w-full border-b bg-white/50 dark:bg-gray-950/50 backdrop-blur-2xl">
          <div className="px-6 m-auto max-w-6xl ">
            <div className="flex flex-wrap items-center justify-between py-2 sm:py-4">
              <div className="w-full items-center flex justify-between lg:w-auto">
                <a href="/" aria-label="tailus logo">
                  {/* Add your SVG or logo here */}
                  <span>Swamp Tutors</span>
                </a>
              </div>
              <div className="w-full group-data-[state=active]:h-fit h-0 lg:w-fit flex-wrap justify-end items-center space-y-8 lg:space-y-0 lg:flex lg:h-fit md:flex-nowrap">
                <ul className="space-y-6 tracking-wide text-base lg:text-sm lg:flex lg:space-y-0">
                  <li>
                    <a href="/login" className="hover:link md:px-4 block">
                      Login
                    </a>
                  </li>
                  <li>
                    <a href="/register" className="hover:link md:px-4 block">
                      Register
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="overflow-hidden">
        <section className="relative">
          <div className="relative pt-24 lg:pt-28">
            <div className="mx-auto px-6 max-w-7xl md:px-12">
              <h1 className="mt-8 text-wrap text-4xl md:text-5xl font-semibold text-title xl:text-5xl xl:[line-height:1.125]">
                Welcome to Swamp Tutors!
              </h1>
              <p className="text-wrap mx-auto mt-8 max-w-2xl text-lg text-body">
                Helping Gators connect with the best tutors.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
