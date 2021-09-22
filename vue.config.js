module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                publish: [
                    {
                        provider: "github",
                        owner: "mnegabriel",
                        private: true,
                        token: "<gh_access_token>"
                    }
                ]
            },
        }
    }
}