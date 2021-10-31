const core = require('@actions/core')
const aws = require('aws-sdk')

const run = async () => {
    try {
        const ecs = new aws.ECS({
            customUserAgent: 'aws-stop-running-task-for-github-actions'
        })
        const cluster = core.getInput('cluster', { required: true })

        try {
            const tasks = await ecs.listTasks({
                cluster,
                desiredStatus: 'RUNNING'
            }).promise()

            if(tasks.taskArns) {
                for (const taskArn of tasks.taskArns) {
                    try {
                        const taskResult = await ecs.stopTask({
                            task: taskArn
                        }).promise()
    
                        core.debug(`Stopped task ${taskResult.task} successfully.`)
                    } catch (error) {
                        core.error(error, {
                            title: `Failed when stopping task ${taskArn}`
                        })
                    }
                }
            }
        } catch (error) {
            core.setFailed("Failed to fetch tasks in ECS: " + error.message)
            throw(error)
        }
    } catch (error) {
        core.setFailed(error.message)
        core.debug(error.stack)
    }
}

module.exports = run