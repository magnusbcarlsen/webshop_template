import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}
// This class extends the AuthGuard from the @nestjs/passport package, specifying 'jwt' as the strategy to be used for authentication.
