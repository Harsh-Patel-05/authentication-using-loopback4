import {TokenService} from '@loopback/authentication';
import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import * as dotenv from 'dotenv';
import {DateTime} from 'luxon';
import otpGenerator from 'otp-generator';
import {TokenServiceBindings} from '../keys';
import {User} from '../models';
import {
  ForgotpasswordRepository,
  SessionRepository,
  UserCredentialsRepository,
  UserRepository,
} from '../repositories';
dotenv.config();


export type Credentials = {
  email: string;
  password: string;
};

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(SessionRepository)
    public sessionRepository: SessionRepository,
    @repository(UserCredentialsRepository)
    public userCredentialsRepository: UserCredentialsRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @repository(ForgotpasswordRepository)
    public forgotpasswordRepository: ForgotpasswordRepository,
  ) { }

  //verify Credentials service method
  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email.toLowerCase()},
    });
    if (!foundUser) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      <string>credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.BadRequest(invalidCredentialsError);
    }

    return foundUser;
  }

  //verify user service method
  async verifyUser(otp: number, otpRef: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const verifyUserResponse: any = {};
    //find user credentials from otpReference
    const userCredentials = await this.userCredentialsRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: <any>{
        'security.otpRef': otpRef,
      },
    });

    const foundUser = await this.userRepository.findOne({
      where: {id: userCredentials?.userId},
    });
    if (!foundUser) {
      throw new HttpErrors.BadRequest('User not found.');
    }

    //check if otp is expired
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiredAt: any = userCredentials?.security?.expiredAt;
    const expiredAtTimestamp = DateTime.fromJSDate(expiredAt).toMillis();
    const currentTimeStamp = DateTime.utc().toMillis();

    if (currentTimeStamp > expiredAtTimestamp) {
      throw new HttpErrors.BadRequest('OTP is expired.');
    }

    //check if otp is valid (from reference)
    if (userCredentials?.security?.otp !== otp) {
      throw new HttpErrors.BadRequest('Enter valid OTP');
    }

    //get user from the UserCredentials
    const user = await this.userRepository.findById(userCredentials?.userId);

    const loginResponse = await this.generateAccessToken(user);
    verifyUserResponse.session = loginResponse.session;
    verifyUserResponse.user = loginResponse.user;

    return verifyUserResponse;
  }

  //generateToken service method
  async generateAccessToken(user: User) {
    const userProfile = this.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    const EXPIRATION_PERIOD = '7D';

    // create session
    const savedSession = await this.sessionRepository.create({
      userId: user?.id,
      accessToken: token,
      status: 'current',
      loginAt: DateTime.utc(),
      expireAt: DateTime.utc()
        .plus({
          hours: parseInt(EXPIRATION_PERIOD),
        })
        .toISO(),
    });

    //update lastLogin for user
    await this.userRepository.updateById(user?.id, {
      lastLoginAt: DateTime.utc(),
    });

    return {
      session: savedSession,
      user,
    };
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      id: user.id,
      email: user.email,
    };
  }

  //send OTP service method
  async sendOtp(email: string, userId: string) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpReference = otpGenerator.generate(6, {digits: true, lowerCaseAlphabets: true, upperCaseAlphabets: true});
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);

    const userCredentials = await this.userCredentialsRepository.findOne({
      where: {
        userId: userId,
      }
    })


    /* Send OTP via email */
    const msg = {
      to: email,
      from: 'harsh.abstud@gmail.com',
      subject: 'Your OTP for Verification',
      html: `<p style="color:black; font-size:25px;letter-spacing:2px;">Your OTP for verification is: <b>${otp}</b></p><p style="color:black; font-size:25px;letter-spacing:2px;">Your OTP Reference for verification is: <b>${otpReference}</b></p>`
    };

    /* Save OTP in the database */
    const security = {
      otp: otp,
      otpRef: otpReference,
      generatedAt: new Date(Date.now()),
      expiredAt: expirationTime,
    };

    // update userCredentials
    await this.userCredentialsRepository.updateById(userCredentials.id, {
      security
    });

    return await sgMail.send(msg).then(() => {
      return {
        statusCode: 200,
        message: 'OTP is sent successfully',
        otpReference,
      };
    }).catch(() => {
      return {
        statusCode: 400,
        message: 'OTP is not sent, Error !',
      };
    });
  }

  //resend OTP service method
  async resendOTP(otpRef: string): Promise<void> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Fetch user credentials based on otpRef
    const userCredentials = await this.userCredentialsRepository.findOne({
      where: <any>{
        'security.otpRef': otpRef,
      },
    });

    const user = await this.userRepository.findOne({
      where: {
        id: userCredentials.userId,
      }
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    // const otpReference = otpGenerator.generate(6, {digits: true, lowerCaseAlphabets: true, upperCaseAlphabets: true});
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 2);

    /* Send OTP via email */
    const msg = {
      to: user.email,
      from: 'harsh.abstud@gmail.com',
      subject: 'Your OTP for Verification',
      html: `<p style="color:black; font-size:25px;letter-spacing:2px;">Your OTP for verification is: <b>${otp}</b></p>`
    };

    /* Save OTP in the database */
    const security = {
      otp: otp,
      otpRef: otpRef,
      generatedAt: new Date(Date.now()),
      expiredAt: expirationTime,
    };

    // update userCredentials
    await this.userCredentialsRepository.updateById(userCredentials.id, {
      security
    });

    return await sgMail.send(msg).then(() => {
      return {
        statusCode: 200,
        message: 'OTP is sent successfully',
        otp,
      };
    }).catch(() => {
      return {
        statusCode: 400,
        message: 'OTP is not sent, Error !',
      };
    });
  }

  async forgotpassword(email: string) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 2);
    const resetToken = otpGenerator.generate(40, {digits: true, lowerCaseAlphabets: true, upperCaseAlphabets: true});

    const user = await this.userRepository.findOne({
      where: {
        email
      }
    });
    if (!user) {
      // User with the provided email not found
      throw new HttpErrors.NotFound('User not found');
    }

    // const resetLink = `http://localhost:3000/explorer/#/AuthController/AuthController.resetPassword/${resetToken}`;

    /* Send OTP via email */
    const msg = {
      to: email,
      from: 'harsh.abstud@gmail.com',
      subject: 'ResetPassword Token',
      html: `<p style="color:black; font-size:25px;letter-spacing:2px;">ResetPassword Token is: <b>${resetToken}</b></p>`
    };

    // update userCredentials
    const password = await this.forgotpasswordRepository.create({
      token: resetToken,
      expireAt: expirationTime
    });


    return await sgMail.send(msg).then(() => {
      return {
        statusCode: 200,
        message: 'ResetPassword Token is sent successfully',
        password
      };
    }).catch(() => {
      return {
        statusCode: 400,
        message: 'ResetPassword Token is not sent, Error !',
      };
    });
  }

  // async generateAndSetOtp(userId: string, forceNewOtp = true) {
  //   //check for the user
  //   const user = await this.userRepository.findById(userId, {
  //     include: ['userCredentials'],
  //   });

  //   if (user) {
  //     if (forceNewOtp) {
  //       return this.sendOtp({
  //         userCredentialsId: user?.userCredentials?.id,
  //         user,
  //       });
  //     } else {
  //       // if forceNewOtp is false then check for the expire time for otp
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const expiredAt: any = user?.userCredentials?.security?.expiredAt;
  //       const expiredAtTimestamp = DateTime.fromJSDate(expiredAt).toMillis();
  //       const expiredAtOneMinuteBefore = DateTime.fromMillis(expiredAtTimestamp)
  //         .minus({
  //           minutes: 1,
  //         })
  //         .toMillis();

  //       const currentTimeStamp = DateTime.utc().toMillis();
  //       if (currentTimeStamp <= expiredAtOneMinuteBefore) {
  //         //if otp is not expired then return otp from model
  //         return {
  //           otp: user.userCredentials.security?.otp,
  //           otpReference: user.userCredentials.security?.otpRef,
  //         };
  //       } else {
  //         return this.sendOtp({
  //           userCredentialsId: user?.userCredentials?.id,
  //           user,
  //         });
  //       }
  //     }
  //   } else {
  //     throw new HttpErrors.NotFound('User not found');
  //   }
  // }

  // async sendOtp(params: {userCredentialsId: string; user: any}) {
  //   const {userCredentialsId} = params;
  //   const otp = generateRandomOtp(6);
  //   const otpReference = generateRandomString(6);

  //   const security = {
  //     otp: otp,
  //     otpRef: otpReference,
  //     generatedAt: new Date(Date.now()),
  //     expiredAt: DateTime.utc().plus({minutes: 2}),
  //   };

  //   // update userCredentials
  //   await this.userCredentialsRepository.updateById(userCredentialsId, {
  //     // security,
  //   });

  //   return {
  //     otp,
  //     otpReference,
  //   };
  // }
}
