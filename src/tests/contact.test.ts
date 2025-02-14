import { identifyContact } from '../services/contact'

type ContactResponse = {
  contact: {
    primaryContactId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}

async function runTests() {
  try {
    console.log('Starting Contact API Tests...\n')

    // Test 1: Create new primary contact
    console.log('Test 1: Creating new primary contact')
    const test1 = await identifyContact({
      email: 'lorraine@hillvalley.edu',
      phoneNumber: '123456'
    })
    console.log('Result:', JSON.stringify(test1, null, 2))
    console.log('Expected: New primary contact with one email and phone\n')

    // Test 2: Link new contact with same phone
    console.log('Test 2: Linking new contact with same phone')
    const test2 = await identifyContact({
      email: 'mcfly@hillvalley.edu',
      phoneNumber: '123456'
    })
    console.log('Result:', JSON.stringify(test2, null, 2))
    console.log('Expected: Two emails, one phone, one secondary contact\n')

    // Test 3: Query by phone only
    console.log('Test 3: Querying by phone only')
    const test3 = await identifyContact({
      phoneNumber: '123456'
    })
    console.log('Result:', JSON.stringify(test3, null, 2))
    console.log('Expected: Same as Test 2\n')

    // Test 4: Create another primary contact
    console.log('Test 4: Creating another primary contact')
    const test4 = await identifyContact({
      email: 'doc@hillvalley.edu',
      phoneNumber: '789012'
    })
    console.log('Result:', JSON.stringify(test4, null, 2))
    console.log('Expected: New primary contact with different email and phone\n')

    // Test 5: Link two primary contacts
    console.log('Test 5: Linking two primary contacts')
    const test5 = await identifyContact({
      email: 'doc@hillvalley.edu',
      phoneNumber: '123456'
    })
    console.log('Result:', JSON.stringify(test5, null, 2))
    console.log('Expected: Three emails, two phones, multiple secondary contacts\n')

    console.log('All tests completed successfully!')
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

// Run the tests
console.log('Running tests...\n')
runTests()