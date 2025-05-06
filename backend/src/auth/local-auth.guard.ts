import { AuthGuard } from '@nestjs/passport';

export class LocalAuthGuard extends AuthGuard('local') {}
// This code defines a LocalAuthGuard class that extends the AuthGuard from the @nestjs/passport package.
