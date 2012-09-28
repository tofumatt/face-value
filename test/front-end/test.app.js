/*global casper:true */
'use strict';

casper.test.comment('Face Value - Homepage')

casper.start('http://localhost:3001', function () {
    this.test.assertTitle('Face Value', 'Homepage has the correct title')

    // Log out what we are doing
    casper.test.info('Testing main app page.')
})

casper.run(function () {
    this.test.done()
})
