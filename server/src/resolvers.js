const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    launches: async (
      parent,
      { pageSize = 20, after },
      { dataSources },
      info,
    ) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });

      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
          allLaunches[allLaunches.length - 1].cursor
          : false,
      };
    },
    launch: (parent, { id }, { dataSources }, info) => {
      return dataSources.launchAPI.getLaunchById({ launchId: id });
    },
    me: (parent, args, { dataSources }, info) => {
      return dataSources.userAPI.findOrCreateUser({
        email: "neevor@testing.com",
      });
    },
  },
  Mission: {
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },
};
