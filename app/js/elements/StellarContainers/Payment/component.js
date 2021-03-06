import React, { Component, PropTypes } from 'react';
import { Dropdown, Header, Form, Message } from 'semantic-ui-react'

import Asset from '../../../components/stellar/Asset';
import { STROOP, AssetInstance, validPk } from '../../../helpers/StellarTools';
const styles = {
  padV: {
    margin: '1rem 0',
  },
};

class Payment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      type: 'payment',
      validDestination: true,
      customDestination: false,
    };
  }

  checkDestination(e) {
    const destinationAddress = e.target.value;
    this.setState({ validDestination: validPk(destinationAddress)})
  }

  submitForm(e, {formData}) {
    e.preventDefault();
    if(!validPk(formData.destination)) {
      return;
    }
    switch(this.state.type) {
      case 'payment': {
        formData.asset = this.props.trustlines[formData.asset];
        this.props.sendPayment(formData);
        break;
      }
      case 'path_payment': {
        if(formData.asset_source === formData.asset_destination) {
          return;
        }
        formData.asset_source = this.props.trustlines[formData.asset_source];
        if(formData.asset_destination === 'custom') {
          formData.asset_destination = AssetInstance({
            asset_code: formData.asset_destination_code,
            asset_issuer: formData.asset_destination_issuer,
          });
        } else {
          formData.asset_destination = this.props.trustlines[formData.asset_destination];
        }
        this.props.sendPathPayment(formData);
        break;
      }
      case 'issue_asset': {
        formData.accountId = this.props.account.account_id;
        this.props.sendIssuePayment(formData);
        break;
      }
      case 'create_account': {
        this.props.sendCreateAccount(formData);
        break;
      }
      case 'account_merge': {
        this.props.sendAccountMerge(formData);
        break;
      }
    }
  }

  getPaymentForm() {
    const getAssetsOptions = assets => assets.map((asset, index) => (
      {
        value: index,
        text: Asset.getAssetString(asset),
      }));

    return (
      <div>
        <Form.Select
          label='Source asset'
          name='asset'
          options={getAssetsOptions(this.props.trustlines)}
          placeholder='Asset to send'
          required
        />
        <Form.Field
          name="amount"
          label='Amount'
          control='input'
          type='number'
          min={0}
          step={STROOP}
          placeholder='0'
          required
        />
      </div>
    );
  }

  getPathPaymentForm() {
    const sourceAssets = this.props.trustlines.map((asset, index) => (
      {
        value: index,
        text: Asset.getAssetString(asset),
      }));
    const destAssets = this.props.trustlines.map((asset, index) => (
      {
        value: index,
        text: Asset.getAssetString(asset),
      }));
    destAssets.push({
      value: "custom",
      text: "Custom",
    });
    function onSelectDestination(e, b) {
      if(b.value === 'custom') {
        this.setState({ customDestination: true })
      } else {
        this.setState({ customDestination: false })
      }
    }

    return (
      <div>
        <Form.Group>
          <Form.Select
            label='Source asset'
            name='asset_source'
            options={sourceAssets}
            placeholder='Asset to send'
            required
          />
          <Form.Select
            label='Destination asset'
            name='asset_destination'
            options={destAssets}
            placeholder='Asset to receive'
            onChange={onSelectDestination.bind(this)}
          />
          {this.state.customDestination ?
            <Form.Group>
              <Form.Field
                name="asset_destination_code"
                label='Code'
                control='input'
                type='text'
                placeholder='EUR'
              />
              <Form.Field
                name="asset_destination_issuer"
                label='Issuer'
                control='input'
                type='text'
                placeholder='GDB...'
              />
            </Form.Group>
            : null}
        </Form.Group>
        <Form.Field
          name="max_amount"
          label='Maximum amount to send'
          control='input'
          type='number'
          min={0}
          step={STROOP}
          placeholder='0'
          required
        />
        <Form.Field
          name="amount_destination"
          label='Amount to receive'
          control='input'
          type='number'
          min={0}
          step={STROOP}
          placeholder='0'
          required
        />
      </div>
    );
  }

  getIssueForm() {

    return (
      <div>
        <Form.Field
          name="asset_code"
          label='Code'
          control='input'
          type='text'
          placeholder='EUR'
          required
        />
        <Form.Field
          name="amount"
          label='Amount'
          control='input'
          type='number'
          min={0}
          step={STROOP}
          placeholder='0'
          required
        />
      </div>
    );
  }

  getCreateAccountForm() {
    return (
      <div>
        <p>
          Click on "Generate keypair" on the menu bar to get a new couple of public and secret key.
        </p>
        <Form.Field
          name="amount"
          label='Starting balance'
          control='input'
          type='number'
          min={0}
          step={STROOP}
          placeholder='0'
          required
        />
      </div>
    );
  }

  getAccountMergeForm() {
    return null;
  }

  getNoSigner() {
    return (
      <div>
        Can't make payment with public key.
      </div>
    )
  }

  render() {
    if(!this.props.canSign) return this.getNoSigner();

    return (
      <div>
        <Header as="h2" textAlign="center">
          Operations
        </Header>
        <Dropdown
          options={
            [
              {text: 'Payment', value: 'payment'},
              {text: 'Path payment', value: 'path_payment'},
              {text: 'Issue asset', value: 'issue_asset'},
              {text: 'Create account', value: 'create_account'},
              {text: 'Account merge', value: 'account_merge'},
            ]
          }
          selection fluid
          color="green"
          value={this.state.type}
          onChange={(e, t) => this.setState({type: t.value})}
        />
        <Form onSubmit={::this.submitForm}
              loading={this.props.sendingPayment}>
          <Form.Field
            name="destination"
            label='Destination account'
            control='input'
            type='text'
            placeholder='GRDT...'
            error={!this.state.validDestination}
            onChange={::this.checkDestination}
            required
          />

          {this.state.type === 'payment' ? this.getPaymentForm() : null}
          {this.state.type === 'path_payment' ? this.getPathPaymentForm() : null}
          {this.state.type === 'issue_asset' ? this.getIssueForm() : null}
          {this.state.type === 'create_account' ? this.getCreateAccountForm() : null}
          {this.state.type === 'account_merge' ? this.getAccountMergeForm() : null}

          <Form.Button
            type='submit'
            fluid
            style={styles.padV}
            primary
            icon="send"
            content="Send"
          />

          <Message
            success
            header='Payment completed !'
            content="You've successfuly sent some money"
          />
          <Message
            error
            header='Payment error'
            content='There was a problem during the payment'
          />
          <Message
            warning
            header='Invalid address'
            content='The address you entered is not a valid stellar address'
          />
        </Form>
      </div>
    );
  }
}

Payment.propTypes = {
  sendingPayment: PropTypes.bool,
  sendPayment: PropTypes.func.isRequired,
  sendPathPayment: PropTypes.func.isRequired,
  sendIssuePayment: PropTypes.func.isRequired,
  sendCreateAccount: PropTypes.func.isRequired,
  sendAccountMerge: PropTypes.func.isRequired,
  account: PropTypes.object,
  trustlines: PropTypes.array,
  canSign: PropTypes.bool,
};

export default Payment;
