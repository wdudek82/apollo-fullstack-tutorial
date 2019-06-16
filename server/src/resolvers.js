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
    missionPatch: (mission, { size } = { size: "LARGE" }, ctx, info) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },
  Launch: {
    isBooked: async (launch, args, { dataSources }, info) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  User: {
    trips: async (parent, args, { dataSources }, info) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

      if (!launchIds.length) return [];

      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        }) || []
      );
    },
  },
  Mutation: {
    login: async (parent, { email }, { dataSources }, info) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) return Buffer.from(email).toString("base64");
    },
    bookTrips: async (parent, { launchIds }, { dataSources }, info) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchesByIds({
        launchIds,
      });

      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? "trips booked successfully"
            : `the following launches couldn't be booked: ${launchIds.filter(
            (id) => !results.includes(id),
            )}`,
        launches,
      };
    },
    cancelTrip: async (parent, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });

      if (!result) {
        return {
          success: false,
          message: "failed to cancel trip",
        };
      }

      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: "trip cancelled",
        launches: [launch],
      };
    },
  },
};
