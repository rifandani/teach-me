// Lesson 7: Schema.Class — a validated domain class with methods.
import { Schema } from "effect"

class Person extends Schema.Class<Person>("app/Person")({
  name: Schema.String,
  age: Schema.Int
}) {
  get greeting() {
    return `Hi, I'm ${this.name}`
  }
}

const ada = new Person({ name: "Ada", age: 36 }) // constructor validates its input
console.log(ada.greeting, ada instanceof Person)

const decoded = Schema.decodeUnknownSync(Person)({ name: "Lin", age: 30 })
console.log(decoded instanceof Person, decoded.greeting)

try {
  new Person({ name: "Bad", age: 1.5 })
} catch (e) {
  console.log("constructor rejected invalid data:", (e as Error).message.split("\n")[0])
}
