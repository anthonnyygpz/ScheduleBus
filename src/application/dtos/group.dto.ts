export class GroupResponseDto {
  constructor(props: GroupResponseDto) {
    this.id = props.id;
    this.name = props.name;
    this.hours = props.hours;
    this.color = props.color;
  }

  public readonly id: number;
  public readonly name: string;
  public readonly hours: number;
  public readonly color: string;
}

export class GroupRequestDto {
  constructor(props: GroupRequestDto) {
    this.name = props.name;
    this.hours = props.hours;
  }

  public readonly name: string;
  public readonly hours: number;
}
