export const apps = [{
    name: "AutoGenie-DB-Backup-CronJob",
    script: "dist/index.js",
    exec_mode: "cluster",
    instances: 1,
    watch: false,
    ignore_watch: ["node_modules"],
    env_production: {
        NODE_ENV: "production"
    },
    env_development: {
        NODE_ENV: "development"
    }
}];