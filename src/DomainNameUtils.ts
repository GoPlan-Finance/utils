export class DomainNameUtils {
  static getDomainNameRegex(): RegExp {
    return /^([a-z0-9|-]+[a-z0-9]+\.)*[a-z0-9|-]+[a-z0-9]+\.[a-z]{2,}$/;
  }
}
