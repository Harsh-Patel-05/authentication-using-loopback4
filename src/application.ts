import {
  AuthenticationBindings,
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {TokenServiceBindings, TokenServiceConstants} from './keys';
import {MySequence} from './sequence';
import {JWTAuthenticationStrategy} from './services/authentication/jwt.auth.strategy';
import {JWTService} from './services/authentication/jwt.service';
import {SecuritySpecEnhancer} from './services/authentication/security.spec.enhancer';

export {ApplicationConfig};

export class NewProjectApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    if (process.env.MODE !== 'production') {
      // Set up default home page
      this.static('/', path.join(__dirname, '../public'));

      // Customize @loopback/rest-explorer configuration here
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      });
      this.component(RestExplorerComponent);
    }

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.configure(AuthenticationBindings.COMPONENT).to({
      defaultMetadata: {strategy: 'jwt'},
    });

    // Mount authentication system
    this.component(AuthenticationComponent);

    // Mount jwt component
    this.add(createBindingFromClass(SecuritySpecEnhancer));

    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
  }
}

