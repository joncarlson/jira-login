import * as core from '@actions/core'
import('node-fetch')

export async function run(): Promise<void> {
	try {
		const baseUrl =
			process.env.JIRA_BASE_URL || core.getInput('JIRA_BASE_URL')
		const token =
			process.env.JIRA_API_TOKEN || core.getInput('JIRA_API_TOKEN')

		if (!baseUrl) throw new Error('JIRA_BASE_URL is not defined')
		if (!token) throw new Error('JIRA_API_TOKEN is not defined')

		// verify login using JIRA
		const user = await getJiraUser({ baseUrl, token })

		core.debug(user)
		core.notice('Logged in successfully')
	} catch (error) {
		// Fail the workflow run if an error occurs
		if (error instanceof Error) core.setFailed(error.message)
	}
}

async function getJiraUser(config: { baseUrl: string; token: string }) {
	const getMyselfUrl: string = `${config.baseUrl}/rest/api/2/myself`

	core.debug(
		`Getting the user using the provided token from: ${getMyselfUrl}`
	)

	let response = await fetch(getMyselfUrl, {
		headers: {
			Authorization: `Bearer ${config.token}`
		}
	})

	if (!response.ok) {
		core.debug(response.toString())
		throw new Error('Failed to login to JIRA')
	}

	return await response.json()
}

run()
