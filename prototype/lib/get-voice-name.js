'use strict'

module.exports = function getAWSPollyVoiceName() {
  /* Amazon Polly Voices:
    Geraint | Gwyneth | Mads | Naja | Hans | Marlene | Nicole | 
    Russell | Amy | Brian | Emma | Raveena | Ivy | Joanna | 
    Joey | Justin | Kendra | Kimberly | Salli | Conchita | 
    Enrique | Miguel | Penelope | Chantal | Celine | Mathieu | 
    Dora | Karl | Carla | Giorgio | Mizuki | Liv | Lotte | 
    Ruben | Ewa | Jacek | Jan | Maja | Ricardo | Vitoria | 
    Cristiano | Ines | Carmen | Maxim | Tatyana | Astrid | Filiz
  */

  // Brian is most British/Boswell-like voice
  // Geraint is a male too, but not as good
  // Joey is an american male
  // Justin is an american male child voice
  return 'Brian'
}
