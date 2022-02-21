import sdk from './1-initialize-sdk.js';

const APP_ADDRESS = '0xDfA44975d93CCb7AE85153F80C98e59C56df02eB';
const app = sdk.getAppModule(APP_ADDRESS);

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: 'ComedyDAO Governance Token',
      symbol: 'COMEDY',
    });

    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address,
    );
  }
  catch (err) {
    console.log('failed to deploy token module', err);
  }
})();
