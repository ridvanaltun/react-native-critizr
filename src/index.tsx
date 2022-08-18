import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';

const { Critizr } = NativeModules;

const emitter = new NativeEventEmitter(Critizr);

enum FeedbackModes {
  START_WITH_FEEDBACK = 'feedback',
  START_WITH_QUIZ = 'quiz',
  ONLY_QUIZ = 'quizonly',
}

enum EventListenerTypes {
  EVENT_RATING_RESULT = 'EVENT_RATING_RESULT',
  EVENT_FEEDBACK_SENT = 'EVENT_FEEDBACK_SENT',
}

interface InitParams {
  apiKey: String;
  languageCode?: String; // 2 letter language code, like fr, en , tr
}

interface User {
  firstname: String;
  lastname: String;
  email: String;
  phone: String;
  crmId: String;
}

interface FeedbackParams {
  mode?: FeedbackModes;
  placeId?: String | null;
  closable?: boolean;
  tag?: string;
}

export default {
  EVENTS: {
    RATING_RESULT: Critizr.EVENT_RATING_RESULT,
    FEEDBACK_SENT: Critizr.EVENT_FEEDBACK_SENT,
  },
  FEEDBACK_MODES: {
    START_WITH_FEEDBACK: Critizr.FEEDBACK_MODE_START_WITH_FEEDBACK,
    START_WITH_QUIZ: Critizr.FEEDBACK_MODE_START_WITH_QUIZ,
    ONLY_QUIZ: Critizr.FEEDBACK_MODE_ONLY_QUIZ,
  },
  getLanguage: (): Promise<String> => {
    return Critizr.getLanguage();
  },
  setLanguage: (languageCode: String) => {
    Critizr.setLanguage(languageCode);
  },
  init: (params: InitParams) => {
    const languageCode = params?.languageCode ? params.languageCode : null;
    Critizr.init(params.apiKey, languageCode);
  },
  setUser: (user: User) => {
    Critizr.setUser(
      user.firstname,
      user.lastname,
      user.email,
      user.phone,
      user.crmId
    );
  },
  openFeedbackDisplay: (params?: FeedbackParams) => {
    const mode = params?.mode ? params.mode : FeedbackModes.START_WITH_FEEDBACK;
    const placeId = params?.placeId ? params.placeId : null;
    const closable = params?.hasOwnProperty('closable')
      ? params.closable
      : true;
    const tag = params?.hasOwnProperty('tag') ? params.tag : null;
    Critizr.openFeedbackDisplay(mode, closable, placeId, tag);
  },
  openStoreDisplay: (placeId: String) => {
    Critizr.openStoreDisplay(placeId);
  },
  requestPlaceRating: (placeId: String) => {
    Critizr.requestPlaceRating(placeId);
  },
  addEventListener: (
    type: EventListenerTypes,
    listener: (...args: any[]) => any
  ): EmitterSubscription => {
    return emitter.addListener(type, listener);
  },
};
