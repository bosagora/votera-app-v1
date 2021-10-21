#include "AppSealingiOS.h"

void iOS()
{
    Appsealing();
}

@interface AppSealingInterface()
@end

@implementation AppSealingInterface
- (instancetype)init
{
    return self;
}

-(int)_IsAbnormalEnvironmentDetected
{
    return ObjC_IsAbnormalEnvironmentDetected() ;
}

char appSealingDeviceID[64];
-(const char*)_GetAppSealingDeviceID
{
    if( ObjC_GetAppSealingDeviceID( appSealingDeviceID ) == 0 )
    {
        return appSealingDeviceID;
    }
    
    //printf("failed to acquire appsealing device unique identifier.\n");
    return "";
}
@end

/*
//-------------------------------------------------------------------------------------------------------------
//  Insert following code into "ViewController.swift" to show Simple UI (swift)
//--------------------------------------------------------------------------------------------------------------
override func viewDidAppear(_ animated: Bool)
{
    super.viewDidAppear( animated );
 
    // query AppSealing device unique identifier (optional)
    let inst: AppSealingInterface = AppSealingInterface();
    let appSealingDeviceID = String.init( cString: inst._GetAppSealingDeviceID() );        
    var msg = "\n-------------------------------------\n* Device ID : " + appSealingDeviceID;

    // check abnormalEnvironmentDetected result
    let tamper = inst._IsAbnormalEnvironmentDetected();
    if ( tamper > 0 )
    {
        msg += "\n\n-------------------------------------\n Abnormal Environment Detected !!\n-------------------------------------";
        if ( tamper & DETECTED_JAILBROKEN ) > 0
            { msg += "\n - Jailbroken"; }
        if ( tamper & DETECTED_DRM_DECRYPTED ) > 0
            { msg += "\n - Executable is not encrypted"; }
        if ( tamper & DETECTED_DEBUG_ATTACHED ) > 0
            { msg += "\n - App is debugged"; }
        if ( tamper & ( DETECTED_HASH_INFO_CORRUPTED | DETECTED_HASH_MODIFIED )) > 0
            { msg += "\n - App integrity corrupted"; }
        if ( tamper & ( DETECTED_CODESIGN_CORRUPTED | DETECTED_EXECUTABLE_CORRUPTED )) > 0
            { msg += "\n - App executable has corrupted"; }
        if ( tamper & DETECTED_CERTIFICATE_CHANGED ) > 0
            { msg += "\n - App has re-signed"; }
    }

    let alertController = UIAlertController( title: "AppSealing Security", message: msg, preferredStyle: .alert )
    alertController.addAction( UIAlertAction( title: "Confirm", style: .default,
                                            handler: { ( action:UIAlertAction! ) -> Void in exit(0); } ));
    self.present( alertController, animated: true, completion: nil );
}

//-------------------------------------------------------------------------------------------------------------
//  Insert following code into "ViewController.mm" to show Simple UI (Objective-C)
// 
//    Note:
//    Change your ViewController to '.mm' if it is '.m'.
//--------------------------------------------------------------------------------------------------------------


- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
 
    NSString* msg = @"\n-------------------------------------\n* AppSealing Device ID : ";
    char _appSealingDeviceID[64];
    
    // query AppSealing device unique identifier (optional)
    if ( ObjC_GetAppSealingDeviceID( _appSealingDeviceID ) == 0 )
        msg = [msg stringByAppendingString:[[NSString alloc] initWithUTF8String:_appSealingDeviceID]];
    else
        msg = [msg stringByAppendingString:@"Unknown"];

    // verification abnormalEnvironmentDetected result (optional)
    int tamper = ObjC_IsAbnormalEnvironmentDetected();
    //NSLog( @"AppSealing Security Threat = %08X", tamper );
    if ( tamper > 0 )
    {
        msg = [msg stringByAppendingString:@"\n\n-------------------------------------\n Abnormal Environment Detected !!\n-------------------------------------"];
        if (( tamper & DETECTED_JAILBROKEN ) > 0 )
            msg = [msg stringByAppendingString:@"\n - Jailbroken"];
        if (( tamper & DETECTED_DRM_DECRYPTED ) > 0 )
            msg = [msg stringByAppendingString:@"\n - Executable is not encrypted"];
        if (( tamper & DETECTED_DEBUG_ATTACHED ) > 0 )
            msg = [msg stringByAppendingString:@"\n - App is debugged"];
        if (( tamper & ( DETECTED_HASH_INFO_CORRUPTED | DETECTED_HASH_MODIFIED )) > 0 )
            msg = [msg stringByAppendingString:@"\n - App integrity corrupted"];
        if (( tamper & ( DETECTED_CODESIGN_CORRUPTED | DETECTED_EXECUTABLE_CORRUPTED )) > 0 )
            msg = [msg stringByAppendingString:@"\n - App executable has corrupted"];
        if (( tamper & DETECTED_CERTIFICATE_CHANGED ) > 0 )
            msg = [msg stringByAppendingString:@"\n - App has re-signed"];
            
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"AppSealing" message:msg preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *confirm = [UIAlertAction actionWithTitle:@"Confirm" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) { exit( 0 ); }];
        [alert addAction:confirm];
        [self presentViewController:alert animated:YES completion:nil];
    }
}
*/
