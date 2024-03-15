import com.typesafe.scalalogging.LazyLogging
import io.gatling.commons.validation.Validation
import io.gatling.core.Predef._
import io.gatling.core.scenario.Simulation
import io.gatling.http.Predef._
import io.gatling.http.request.builder.HttpRequestBuilder

import java.time.Instant
import java.util.UUID
import scala.concurrent.duration._

class GateSimulation extends Simulation with LazyLogging {

  val numberOfUsers = 60

  //"randomAddress" -> s"${Random.alphanumeric.take(42).mkString}"
  private def randomValues = Map("startedAt" -> Instant.now(), "nonce" -> UUID.randomUUID(), "gateUUID" -> "c32d8b45-92fe-44f6-8b61-42c2107dfe87")

  private val feeder = Iterator.continually(randomValues)

  private val requestAccess: HttpRequestBuilder = http("Request access")
    .post("http://localhost:3001/access")
    //    .body(StringBody(accessRequestBody("#{randomUuid()}")))
    .body(StringBody(
      s"""
         |{
         |  "gateUUID": "#{gateUUID}",
         |  "mnemonic": "hollow useful dry sustain key retreat goat become black ramp trumpet craft thumb ozone viable near topic cloth match alarm hazard legal afford speak",
         |  "nonce": "#{nonce}"
         |}
     """.stripMargin))
    .asJson
    .check(status is 200)
    .check(jsonPath("$..carAddress").ofType[String].exists.saveAs("carAddress"))

  private val receiveAccessEvent = asLongAs(notReceived)(
    pause(1000.millis)
      .exec(
        http("Poll for event state")
          .get("http://localhost:3002/nonce/#{nonce}")
          .asJson
          .check(status is 200)
          .check(jsonPath("$..found").ofType[Boolean].exists.saveAs("received"))
      )
  )

  private def notReceived(sess: Session): Validation[Boolean] = {
    val received = sess("received").asOption[Boolean].getOrElse(false)
    val address = sess("carAddress").asOption[String].getOrElse("not present")
    //    println(s"Event received: $received for address: $address")
    received == false
  }

  private val driversScenario = scenario("Drivers").group("Drivers report completed") {
    feed(feeder)
      .exec(requestAccess)
      .exec(receiveAccessEvent)
      .exec((session: Session) => {
        val nonce: String = session.attributes("nonce").toString
        val carAddress: String = session.attributes("carAddress").toString
        val gateUUID: String = session.attributes("gateUUID").toString
        println(s"session nonce: ${nonce} gateUUID: ${gateUUID} carAddress: ${carAddress}")
        session
      })
  }

  setUp(driversScenario.inject(rampUsers(numberOfUsers).during(1.minute))).maxDuration(2.minute)
}
