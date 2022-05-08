# react-native-critizr

[![npm version](https://img.shields.io/npm/v/react-native-critizr.svg)](https://npmjs.com/package/react-native-critizr)
[![npm downloads](https://img.shields.io/npm/dt/react-native-critizr.svg)](https://npmjs.com/package/react-native-critizr)
[![CircleCI](https://circleci.com/gh/ridvanaltun/react-native-critizr/tree/master.svg?style=shield)](https://circleci.com/gh/ridvanaltun/react-native-critizr/tree/master)
[![license](https://img.shields.io/npm/l/react-native-critizr.svg)](https://github.com/ridvanaltun/react-native-critizr/blob/master/LICENSE)

> React Native wrapper for Critizr

## Getting started

```sh
npm install react-native-critizr
```

### Additional installation steps

#### Android

This module does not require any extra step after rebuilding your app.

#### iOS

1. Add the Critizr SDK by adding the following line to your Podfile.

```
pod "Critizr-ios", :git => "https://github.com/critizr/critizr-ios-pod.git", :tag => "1.2.8"
```

2. Then install it

```sh
pod install
```

3. Fill in the Critizr API Key in the info.plist file before calling methods on the Critizr SDK:

```xml
<key>CritizrAPIKey</key>
<string>Critizr API Key</string>
```

4. Fill in the Critizr environment in the info.plist file before calling methods on the Critizr SDK (don't forget to replace it with your own):

```xml
<key>CritizrEnvironement</key>
<string>PreProduction</string>
```

or

```xml
<key>CritizrEnvironement</key>
<string>Production</string>
```

## Usage

Importing the library:

```js
import Critizr from 'react-native-critizr';
```

Initiliaze (Only works on Android):

```js
Critizr.init({
  apiKey: 'my-secret-api-key',
  languageCode: 'en',
});
```

Manage language:

```js
const language = await Critizr.getLanguage();

Critizr.setLanguage('fr');
```

Set user for current instance:

```js
Critizr.setUser({
  firstname: 'Michael',
  lastname: 'Scott',
  email: 'michael.scott@dundermifflin.com',
  phone: '0123456789',
  crmId: '123ABC',
});
```

Open feedback display:

```js
// you don't have to give any parameter
Critizr.openFeedbackDisplay();

// show a targeted place
Critizr.openFeedbackDisplay({ placeId: 'your-place-id' });

//
// show a targeted place with different modes
//

Critizr.openFeedbackDisplay({
  placeId: 'your-place-id',
  mode: Critizr.FEEDBACK_MODES.START_WITH_FEEDBACK, // default
});

Critizr.openFeedbackDisplay({
  placeId: 'your-place-id',
  mode: Critizr.FEEDBACK_MODES.START_WITH_QUIZ,
});

Critizr.openFeedbackDisplay({
  placeId: 'your-place-id',
  mode: Critizr.FEEDBACK_MODES.ONLY_QUIZ,
});
```

Open store display:

```js
Critizr.openStoreDisplay('your-place-id');
```

Get ratings using event listener:

```js
useEffect(() => {
  const listener = Critizr.addEventListener(
    Critizr.EVENTS.RATING_RESULT,
    (e) => {
      if (e?.customerRelationship) {
        setResult(
          `Customer Relationship: ${e.customerRelationship}, Satisfaction: ${e.satisfaction}`
        );
      } else {
        setResult('Event Rating Error!');
      }
    }
  );

  return () => listener.remove();
}, []);
```

You can perceive whether the user gives feedback (Only works on Android):

```js
useEffect(() => {
  const listener = Critizr.addEventListener(
    Critizr.EVENTS.FEEDBACK_SENT,
    (_) => {
      console.log('User given a feedback!');
    }
  );

  return () => listener.remove();
}, []);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
