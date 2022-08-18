#import "Critizr.h"
#import <Critizr/Critizr.h>
#import <React/RCTUtils.h>

@implementation Critizr
{
  BOOL _hasListeners;
}

RCT_EXPORT_MODULE()

NSString *language = @"en";
NSString *apiKey;
NSString *user;

// EVENT TYPES
NSString *EVENT_RATING_RESULT = @"EVENT_RATING_RESULT";
NSString *EVENT_FEEDBACK_SENT = @"EVENT_FEEDBACK_SENT";

// FEEDBACK MODES
NSString *FEEDBACK_MODE_START_WITH_FEEDBACK = @"feedback";
NSString *FEEDBACK_MODE_START_WITH_QUIZ = @"quiz";
NSString *FEEDBACK_MODE_ONLY_QUIZ = @"quizonly";

-(void)startObserving {
    _hasListeners = YES;
}

-(void)stopObserving {
    _hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[EVENT_RATING_RESULT,
             EVENT_FEEDBACK_SENT];
}

- (NSDictionary *) constantsToExport {
    return @{
        @"EVENT_RATING_RESULT": EVENT_RATING_RESULT,
        @"EVENT_FEEDBACK_SENT": EVENT_FEEDBACK_SENT,

        @"FEEDBACK_MODE_START_WITH_FEEDBACK": FEEDBACK_MODE_START_WITH_FEEDBACK,
        @"FEEDBACK_MODE_START_WITH_QUIZ": FEEDBACK_MODE_START_WITH_QUIZ,
        @"FEEDBACK_MODE_ONLY_QUIZ": FEEDBACK_MODE_ONLY_QUIZ,
    };
}

// necessary for constantsToExport
+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

// necessary for run the app main thread only
// RCTPresentedViewController() works on only main thread
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_REMAP_METHOD(init,
                 initialApiKey:(nonnull NSString*)initialApiKey
                 initialLanguage:(NSString*)initialLanguage)
{
    apiKey = initialApiKey;

    if (initialLanguage) {
        language = initialLanguage;
    }
}

RCT_REMAP_METHOD(getLanguage,
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(language);
}

RCT_REMAP_METHOD(setLanguage,
                 withNewLanguage:(nonnull NSString*)newLanguage)
{
    language = newLanguage;
}

RCT_REMAP_METHOD(setUser,
                 withFirstName:(nonnull NSString*)firstName
                 withLastname:(nonnull NSString*)lastName
                 withEmail:(nonnull NSString*)email
                 withPhone:(nonnull NSString*)phone
                 withCrmId:(nonnull NSString*)crmId)
{
    NSArray  *params = [NSArray arrayWithObjects:firstName, lastName, email, phone, crmId, nil];
    NSString *mergedParams = [params componentsJoinedByString:@"|"];

    NSData *plainData = [mergedParams dataUsingEncoding:NSUTF8StringEncoding];
    NSString *base64String = [plainData base64EncodedStringWithOptions:0];

    user = base64String;
}

RCT_REMAP_METHOD(openFeedbackDisplay,
                 withMode:(NSString*)mode
                 withClosable:(BOOL*)closable
                 withPlaceId:(NSString*)placeId
                 withTag:(NSString*)tag)
{
    CRFeedbackDialog *feedbackDialog = [CRFeedbackDialog feedbackDialog];

    NSMutableDictionary *params = [[NSMutableDictionary alloc] init];

    params[@"mode"] = mode;
    params[@"closable"] = closable ? @"true" : @"false";
    params[@"lang"] = language;

    if(user) params[@"user"] = user;

    if(tag) params[@"tag"] = tag;

    UIViewController *topViewController = RCTPresentedViewController();

    if(placeId) {
        [feedbackDialog presentFeedbackDialogFrom:topViewController withStoreIdString:placeId withParams:params];
    } else {
        [feedbackDialog presentFeedbackDialogFrom:topViewController withParams:params];
    }
}

RCT_REMAP_METHOD(openStoreDisplay,
                 placeIdForStoreDisplay:(NSString*)placeId)
{
    CRFeedbackDialog *feedbackDialog = [CRFeedbackDialog feedbackDialog];

    NSMutableDictionary *params = [[NSMutableDictionary alloc] init];

    params[@"lang"] = language;

    if(user) params[@"user"] = user;

    UIViewController *topViewController = RCTPresentedViewController();

    [feedbackDialog presentStoreDisplayDialogFrom:topViewController withStoreIdString:placeId withParams:params];
}

RCT_REMAP_METHOD(requestPlaceRating,
                 placeIdForPlaceRating:(nonnull NSString*)placeId)
{
    CRSdk *sdk = [CRSdk critizrSDKInstance:self];
    [sdk fetchRatingForPlace:placeId withDelegate:self];
}

- (void)critizrPlaceRatingFetched:(double)customerRelationshipRating withSatisfaction:(double)satisfactionRating {
    if (_hasListeners) {
        NSString *strSatisfactionRating = [NSString stringWithFormat:@"%.1f", satisfactionRating];
        NSString *strCustomerRelationshipRating = [NSString stringWithFormat:@"%.1f", customerRelationshipRating];
        [self sendEventWithName:EVENT_RATING_RESULT body:@{@"customerRelationship": strCustomerRelationshipRating, @"satisfaction": strSatisfactionRating}];
    }
}

- (void)critizrPlaceRatingError:(NSError *)anError {
    if (_hasListeners)
        [self sendEventWithName:EVENT_RATING_RESULT body:@{}];
}

@end
