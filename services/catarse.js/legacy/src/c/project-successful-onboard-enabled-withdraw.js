import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectSuccessfulProgressBar from './project-successful-progress-bar';

const I18nScope = _.partial(h.i18nScope, 'projects.insights.enabled_withdraw');

const projectSuccessfulEnabledWithdraw = {

    controller: function(args) {
        const balanceUrl = `/${window.I18n.locale}/users/${args.project().user_id}/edit#balance`;

        return {
            balanceUrl
        };
    },

    view: function (ctrl, args) {
        return m('.u-marginbottom-40.w-row', [
            m('.w-col.w-col-1'),
            m('.w-col.w-col-10', [
                m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10.u-text-center.dashboard-header', I18n.t('title', I18nScope())),
                m(projectSuccessfulProgressBar, { project: args.project, current_state: args.current_state }),
                m('.u-marginbottom-40.u-text-center.w-row', [
                    m('.w-col.w-col-2'),
                    m('.w-col.w-col-8', [
                        m('p.fontsize-base.u-marginbottom-30', [
                            m('span.fontweight-semibold', args.project().user.name),
                            I18n.t('text_1', I18nScope()),
                            m('span.fontweight-semibold', I18n.t('text_2', I18nScope())),
                            I18n.t('text_3', I18nScope()),
                            m('a.alt-link.fontweight-semibold[href=\'https://suporte.catarse.me/hc/pt-br/articles/217916143\'][target=\'_blank\']',
                                I18n.t('text_4', I18nScope())
                            )
                        ]),
                        m(`a.btn.btn-large.btn-inline.w-button[href=\'${ctrl.balanceUrl}\']`, I18n.t('button_text', I18nScope()))
                    ]),
                    m('.w-col.w-col-2')
                ])
            ]),
            m('.w-col.w-col-1')
        ]);
    }
};

export default projectSuccessfulEnabledWithdraw;
