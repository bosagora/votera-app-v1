//
//  AppsealingiOS.h
//  AppsealingiOS
//
//  Created by puzznic on 23/01/2019.
//  Copyright © 2019 Inka. All rights reserved.
//

#ifndef AppsealingiOS_h
#define AppsealingiOS_h

#define DETECTED_JAILBROKEN             0x00000001
#define DETECTED_DRM_DECRYPTED          0x00000002
#define DETECTED_DEBUG_ATTACHED         0x00000004
#define DETECTED_HASH_INFO_CORRUPTED    0x00000008
#define DETECTED_CODESIGN_CORRUPTED     0x00000010
#define DETECTED_HASH_MODIFIED          0x00000020
#define DETECTED_EXECUTABLE_CORRUPTED   0x00000040
#define DETECTED_CERTIFICATE_CHANGED    0x00000080


#import <Foundation/Foundation.h>

extern void Appsealing(void);
extern int ObjC_IsAbnormalEnvironmentDetected();
extern int ObjC_GetAppSealingDeviceID( char* deviceIDBuff );

@interface AppSealingInterface : NSObject
- (int)_IsAbnormalEnvironmentDetected;
- (const char*)_GetAppSealingDeviceID;
@end

#endif /* AppsealingiOS_h */
