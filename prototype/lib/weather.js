'use strict'

const numbered = require('numbered')
const request  = require('request')


// provides output that is acceptable to render via voice output
// combines the "conditions" and "forecast" api in one call
function _getReport(postal, useMetric) {
  const path = `/api/${process.env.WEATHER_API_KEY}/conditions/forecast/q/${postal}.json`
  const opts = {
    url: `http://api.wunderground.com${path}`,
    json: true,
    timeout: 1000
  }

  return new Promise(function(resolve, reject) {
    return request.get(opts, function(er, res, body) {
      if (er) {
        return reject(er)
      }

      if (res.statusCode >= 500) {
        return reject('weather service unavailable')
      }

      // TODO: pull air quality from aqicn
      //  https://www.npmjs.com/package/aqicn
      //  http://aqicn.org/search/#q=Long Beach, CA
      return resolve(body)
    })
  })
}


function _formatForecast(body, useMetric) {
  // today's forecast is the first one
  let amount, degrees, rainAmount, snowAmount, unit
  const forecast = body.forecast.simpleforecast.forecastday[0]

  let result = ''

  const t = new Date()
  if (t.getHours() < 13) {
    // before 1pm, report the high temperature for the day
    if (useMetric) {
      degrees = forecast.high.celsius
    } else {
      degrees = forecast.high.fahrenheit
    }
    result = `Expect ${forecast.conditions} today. High of ${numbered.stringify(degrees)} degrees, with ${numbered.stringify(forecast.avehumidity)} percent humidity.`

  } else {
    // after 1pm, report low temperature for evening
    if (useMetric) {
      degrees = forecast.low.celsius
    } else {
      degrees = forecast.low.fahrenheit
    }
    result = `Expect ${forecast.conditions} tonight. Low of ${numbered.stringify(degrees)} degrees.`
  }

  // precipitation units
  if (useMetric) {
    rainAmount = forecast.qpf_allday.mm
    snowAmount = forecast.snow_allday.mm
    unit = 'millimeters'
  } else {
    rainAmount = forecast.qpf_allday.in
    snowAmount = forecast.snow_allday.in
    unit = 'inches'
  }

  // report rain
  if (forecast.qpf_allday.in > 6) {
    result += ` Heavy rain up to ${numbered.stringify(rainAmount)} ${unit} is expected.`
  }
  if (forecast.qpf_allday.in > 2) {
    result += ` Rain up to ${numbered.stringify(rainAmount)} ${unit} is expected.`
  } else if (forecast.qpf_allday.in > 0) {
    result += " Light rain is expected."
  }

  // report snow
  if (forecast.snow_allday.in > 6) {
    result += ` Heavy snow up to ${numbered.stringify(snowAmount)} ${unit} is expected.`
  }
  if (forecast.snow_allday.in > 2) {
    result += ` Snow up to ${numbered.stringify(snowAmount)} ${unit} is expected.`
  } else if (forecast.snow_allday.in > 0) {
    result += " Light snow is expected."
  }

  // report heavy winds
  if (forecast.avewind.mph >= 40) {
    if (useMetric) {
      amount = forecast.avewind.mph
      unit = 'kilometers per hour'
    } else {
      amount = forecast.avewind.kph
      unit = 'miles per hour'
    }
    result += ` Expect heavy winds averaging ${numbered.stringify(amount)} ${unit}.`
  } else if (forecast.maxwind.mph >= 40) {
    if (useMetric) {
      amount = forecast.maxwind.mph
      unit = 'kilometers per hour'
    } else {
      amount = forecast.maxwind.kph
      unit = 'miles per hour'
    }
    result += ` Expect gusts of wind up to ${numbered.stringify(amount)} ${unit}.`
  }

  return result
}


function _getUVText(uvIndex) {
  // https://en.wikipedia.org/wiki/Ultraviolet_index
  let uvText = ""
  if (uvIndex <= 2.9) { // Low
    uvText = ""
  } else if ((uvIndex >= 3) && (uvIndex <= 5.9)) { // Moderate
    uvText = ` The UV index is moderate today.  If you're going to be outside a lot, \
be sure to cover up.`
  } else if ((uvIndex >= 6) && (uvIndex <= 7.9)) { // High
    uvText = ` The UV index is high today.  Be sure to wear sun protective clothing and a hat. \
SPF 30+ sunscreen and sunglasses are also recommended.`
  } else if ((uvIndex >= 8) && (uvIndex <= 10.9)) { // Very High
    uvText = ` The UV index is very high today!  Be sure to wear sun protective clothing \
and SPF 30+ sunscreen.  Don't stay in the sun for too long if you can help it.`
  } else if (uvIndex >= 11) { // Extreme
    uvText = ` The UV index is extreme today!  Be sure to take all precautions. \
Wear SPF 30+ sunscreen, a long-sleeved shirt, pants, sunglasses, and a very broad hat. \
Try and avoid exposure to the sun as much as possible.`
  }
  return uvText
}


module.exports = async function getWeather(options={}) {
  if(!options.postal) {
    return 'Sorry I couldn\'t get the weather results. What is your zip code?'
  }

  const feedback = await _getReport(options.postal, options.useMetric)
  let weatherResults = _formatForecast(feedback, options.useMetric)
  weatherResults += _getUVText(feedback.current_observation.UV)

  return weatherResults
}
