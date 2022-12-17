//
//  NavigationPalette.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

import { Combobox, Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { ChangeEvent, Fragment, useCallback, useMemo, useState } from "react";
import { manifest } from "../../common/Manifest";
import type { XFC } from "../../common/XFC";

type Props = {
  isOpen: boolean;
  close: () => void;
};

/**
 * Navigation command palette with clear and clean transitions
 * @param param0.isOpen State to determine whether to show the command palette or not
 * @param param0.close Calback to close the command palette and perform cleanup
 */
const NavigationPalette: XFC<Props> = ({ isOpen, close }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  /**
   * Queried routes from the search query
   */
  const filteredRoutes = useMemo(
    () =>
      !query
        ? manifest.routes
        : manifest.routes.filter(
            ({ name, href }) =>
              name.toLowerCase().includes(query.toLowerCase()) ||
              href.toLowerCase().includes(query.toLowerCase())
          ),
    [query]
  );

  /**
   * Navigate to a selected route callback
   */
  const navigate = useCallback(
    (value: unknown) => {
      if (typeof value !== "string") {
        return;
      }
      router.push(value);
      close();
    },
    [router, close]
  );

  /**
   * Update search query callback
   */
  const updateQuery = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  return (
    <Transition.Root
      show={isOpen}
      as={Fragment}
      afterLeave={() => setQuery("")}
    >
      <Dialog
        className="fixed inset-0 p-4 pt-[30vh] overflow-y-auto z-10"
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm md:bg-neutral-200/70" />
        </Transition.Child>
        <Transition.Child
          enter="duration-300 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            as="div"
            onChange={navigate}
            className="relative border-0 bg-white max-w-[100vw] md:max-w-xl mx-auto rounded-xl shadow-2xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden"
          >
            <div className="px-4 py-1">
              <Combobox.Input
                className="w-full bg-transparent h-8 md:h-12 border-0 focus:ring-0 focus:outline-none focus:outline-0 text-xs md:text-sm text-gray-800 placeholder-gray-400"
                placeholder="Search for a page"
                onChange={updateQuery}
              />
            </div>
            {filteredRoutes.length > 0 && (
              <Combobox.Options
                static
                className="py-2 text-xs md:py-3 md:text-sm max-h-60 overflow-y-auto"
              >
                {filteredRoutes.map(({ name, href }) => (
                  <Combobox.Option key={href} value={href}>
                    {({ active }) => (
                      <div
                        className={`px-3 md:px-4 py-2 space-x-1 ${
                          active ? "bg-blue-600" : "bg-white"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            active ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {name}
                        </span>
                        <span
                          className={active ? "text-blue-200" : "text-gray-400"}
                        >
                          in "{href}"
                        </span>
                      </div>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
            {!!query && filteredRoutes.length == 0 && (
              <p className="p-3 md:p-4 text-xs md:text-sm text-gray-500">
                No result found
              </p>
            )}
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
};

export default NavigationPalette;
