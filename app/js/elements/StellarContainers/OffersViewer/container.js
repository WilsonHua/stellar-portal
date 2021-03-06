import { connect } from 'react-redux';
import Component from './component'

import { canSign, getOffers, getTrustlines, isSendingOffer } from '../../../helpers/selector';
import { createOffer, deleteOffer } from '../../../actions-creators/stellar';

const mapStateToProps = (state) => ({
  offers: getOffers(state),
  trustlines: getTrustlines(state),
  canSign: canSign(state),
  sendingOffer: isSendingOffer(state),
});

const mapDispatchToProps = { createOffer, deleteOffer };

export default connect(mapStateToProps, mapDispatchToProps)(Component);
