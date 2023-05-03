import type { GetServerSidePropsResult, NextPage } from "next";
import type { NavbarTab } from "~/components/layout/navbar";

const Leagues: NextPage = () => {
  return (
    <section>
      <div className="mx-auto max-w-2xl py-8 px-4 lg:py-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Create a league
        </h2>
        <form action="#">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-900 "
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="focus:ring-primary-600 focus:border-primary-600   block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900  dark:placeholder-gray-400"
                placeholder="Type league name"
                required={true}
              />
            </div>
            <div className="w-full">
              <label
                htmlFor="brand"
                className="mb-2 block text-sm font-medium text-gray-900 "
              >
                Brand
              </label>
              <input
                type="text"
                name="brand"
                id="brand"
                className="focus:ring-primary-600 focus:border-primary-600   block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900  dark:placeholder-gray-400"
                placeholder="Product brand"
                required={true}
              />
            </div>
            <div className="w-full">
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-gray-900 "
              >
                Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                className="focus:ring-primary-600 focus:border-primary-600   block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900  dark:placeholder-gray-400"
                placeholder="$2999"
                required={true}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-900 "
              >
                Category
              </label>
              <select
                id="category"
                className="focus:ring-primary-500 focus:border-primary-500   block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900  dark:placeholder-gray-400"
              >
                <option>Select category</option>
                <option value="TV">TV/Monitors</option>
                <option value="PC">PC</option>
                <option value="GA">Gaming/Console</option>
                <option value="PH">Phones</option>
              </select>
            </div>
            <div>
              <div>
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value=""
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label
                  htmlFor="default-checkbox"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Default checkbox
                </label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-900 "
              >
                Description
              </label>
              <textarea
                id="description"
                rows={8}
                className="focus:ring-primary-500 focus:border-primary-500   block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900  dark:placeholder-gray-400"
                placeholder="Your description here"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary-700 focus:ring-primary-200 sm:mt-6"
          >
            Add product
          </button>
        </form>
      </div>
    </section>
  );
};

export const getServerSideProps = (): GetServerSidePropsResult<{
  currentTab: NavbarTab;
}> => ({ props: { currentTab: "Leagues" } });

export default Leagues;
