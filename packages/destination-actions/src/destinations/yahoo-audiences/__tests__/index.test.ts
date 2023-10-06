import nock from 'nock'
import { IntegrationError, createTestIntegration } from '@segment/actions-core'

import Destination from '../index'

const AUDIENCE_ID = 'aud_123456789012345678901234567' // References audienceSettings.audience_id
const AUDIENCE_KEY = 'sneakers_buyers' // References audienceSettings.audience_key
const ENGAGE_SPACE_ID = 'acme_corp_engage_space' // References settings.engage_space_id
const MDM_ID = 'mdm 123' // References settings.mdm_id
const CUST_DESC = 'ACME Corp' // References settings.customer_desc

const createAudienceInput = {
  settings: {
    engage_space_id: ENGAGE_SPACE_ID,
    mdm_id: MDM_ID,
    customer_desc: CUST_DESC
  },
  audienceName: '',
  audienceSettings: {
    audience_key: AUDIENCE_KEY,
    audience_id: AUDIENCE_ID,
    identifier: ''
  }
}

describe('Yahoo Audiences', () => {
  describe('createAudience() function', () => {
    let testDestination: any
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules() // Most important - it clears the cache
      process.env = { ...OLD_ENV } // Make a copy
      process.env.ACTIONS_YAHOO_AUDIENCES_TAXONOMY_CLIENT_SECRET = 'yoda'
      process.env.ACTIONS_YAHOO_AUDIENCES_TAXONOMY_CLIENT_ID = 'luke'
      testDestination = createTestIntegration(Destination)
    })

    afterAll(() => {
      process.env = OLD_ENV // Restore old environment
    })

    describe('Success cases', () => {
      it('It should create the audience successfully', async () => {
        nock('https://datax.yahooapis.com').put(`/v1/taxonomy/append/${ENGAGE_SPACE_ID}`).reply(202, {
          anything: '123'
        })

        createAudienceInput.audienceSettings.identifier = 'anything'
        const result = await testDestination.createAudience(createAudienceInput)
        expect(result.externalId).toBe(AUDIENCE_ID)
      })
    })
    describe('Failure cases', () => {
      it('should throw an error when audience_id setting is missing', async () => {
        createAudienceInput.settings.engage_space_id = 'acme_corp_engage_space'
        createAudienceInput.audienceSettings.audience_key = 'sneakeres_buyers'
        createAudienceInput.audienceSettings.audience_id = ''
        await expect(testDestination.createAudience(createAudienceInput)).rejects.toThrowError(IntegrationError)
      })

      it('should throw an error when audience_key setting is missing', async () => {
        createAudienceInput.settings.engage_space_id = 'acme_corp_engage_space'
        createAudienceInput.audienceSettings.audience_key = ''
        createAudienceInput.audienceSettings.audience_id = 'aud_12345'
        await expect(testDestination.createAudience(createAudienceInput)).rejects.toThrowError(IntegrationError)
      })

      it('should throw an error when engage_space_id setting is missing', async () => {
        createAudienceInput.settings.engage_space_id = ''
        createAudienceInput.audienceSettings.audience_key = 'sneakeres_buyers'
        createAudienceInput.audienceSettings.audience_id = 'aud_123456789012345678901234567'
        await expect(testDestination.createAudience(createAudienceInput)).rejects.toThrowError(IntegrationError)
      })
    })
  })
})
