import { ApiHeader, ApiBadRequestResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { ErrorDTO } from 'src/dto/error.dto';

export function ApiCommonHeader(errorTypes: string[] = []): MethodDecorator {
  let BAD_REQUEST_RESPONSE = "Returns object containing error message when unsuccessful";
  if (errorTypes.length > 0) {
    BAD_REQUEST_RESPONSE += ".\nError types: ";
    for (let i = 0; i < errorTypes.length; i++) {
      BAD_REQUEST_RESPONSE += errorTypes[i];
      if (i < errorTypes.length - 1) {
        BAD_REQUEST_RESPONSE += ", ";
      }
    }
  }

  return (target: object, key?, descriptor?: TypedPropertyDescriptor<any>) => {
    ApiHeader({ name: 'Authorization', description: 'The encrypted access token of the user', required: true })(target, key, descriptor);
    ApiBadRequestResponse({ description: BAD_REQUEST_RESPONSE, type: ErrorDTO })(target, key, descriptor);
    ApiForbiddenResponse({ description: "AccessToken in header is invalid or TFA in header is incorrect (if enabled)" })(target, key, descriptor);
  };
}
