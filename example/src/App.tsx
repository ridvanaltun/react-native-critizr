import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Critizr from 'react-native-critizr';

const API_KEY = '7f614697ac3524af3ca4ce0df9164caf';
const PLACE_ID = 'velo-aix-en-provence';

type ButtonProps = {
  text: string;
  onPress: () => void;
};

const Button = ({ text, onPress }: ButtonProps) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const App = () => {
  const [result, setResult] = useState<String | undefined>();

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

  return (
    <ScrollView style={styles.container}>
      <Button
        text="get language"
        onPress={() => Critizr.getLanguage().then(setResult)}
      />
      <Button
        text="set language to Turkish"
        onPress={() => Critizr.setLanguage('tr')}
      />
      <Button
        text="set language to English"
        onPress={() => Critizr.setLanguage('en')}
      />
      <Button
        text="init"
        onPress={() =>
          Critizr.init({
            apiKey: API_KEY,
          })
        }
      />
      <Button
        text="init with language"
        onPress={() =>
          Critizr.init({
            apiKey: API_KEY,
            languageCode: 'en',
          })
        }
      />
      <Button
        text="set user as Micheal Scott"
        onPress={() =>
          Critizr.setUser({
            firstname: 'Michael',
            lastname: 'Scott',
            email: 'michael.scott@dundermifflin.com',
            phone: '0123456789',
            crmId: '123ABC',
          })
        }
      />
      <Button
        text="open feedback display"
        onPress={() => Critizr.openFeedbackDisplay()}
      />
      <Button
        text="open feedback display with place id"
        onPress={() => Critizr.openFeedbackDisplay({ placeId: PLACE_ID })}
      />
      <Button
        text="open feedback display (start with quiz)"
        onPress={() =>
          Critizr.openFeedbackDisplay({
            placeId: PLACE_ID,
            mode: Critizr.FEEDBACK_MODES.START_WITH_QUIZ,
          })
        }
      />
      <Button
        text="open feedback display (only quiz)"
        onPress={() =>
          Critizr.openFeedbackDisplay({
            placeId: PLACE_ID,
            mode: Critizr.FEEDBACK_MODES.ONLY_QUIZ,
          })
        }
      />
      <Button
        text="open store display"
        onPress={() => Critizr.openStoreDisplay(PLACE_ID)}
      />
      <Button
        text="request place rating"
        onPress={() => Critizr.requestPlaceRating(PLACE_ID)}
      />
      <Text style={styles.text}>Result: {result}</Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 5,
    backgroundColor: 'dodgerblue',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default App;
