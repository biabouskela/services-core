import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectDataTable from './project-data-table';
import projectDataChart from './project-data-chart';

const projectContributions = {
    controller(args) {
        const contributionsPerLocation = m.prop([]),
            contributionsPerDay = m.prop([]),
            listVM = postgrest.paginationVM(models.projectContribution),
            filterStats = postgrest.filtersVM({
                project_id: 'eq'
            }),
            filterVM = postgrest.filtersVM({
                project_id: 'eq',
                waiting_payment: 'eq'
            }),
            toggleWaiting = (waiting = false) => {
                return () => {
                    filterVM.waiting_payment(waiting);
                    listVM.firstPage(filterVM.parameters());
                };
            },
            groupedCollection = (collection = []) => {
                let grouped = [
                        []
                    ],
                    group = 0;

                _.map(collection, (item, index) => {
                    if (grouped[group].length >= 3) {
                        group = group + 1;
                        grouped[group] = [];
                    }

                    grouped[group].push(item);
                });

                return grouped;
            },
            contributionsStats = m.prop({});

        filterVM.project_id(args.project().id).waiting_payment(false);
        filterStats.project_id(args.project().id);

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }
        //TODO: Abstract table fetch and contruction logic to contributions-vm to avoid insights.js duplicated code.
        const lContributionsPerDay = postgrest.loader(models.projectContributionsPerDay.getRowOptions(filterStats.parameters()));
        lContributionsPerDay.load().then(contributionsPerDay);

        let contributionsPerLocationTable = [
            ['Estado', 'Apoios', 'R$ apoiados (% do total)']
        ];
        const buildPerLocationTable = (contributions) => {
            return (!_.isEmpty(contributions)) ? _.map(_.first(contributions).source, (contribution) => {
                let column = [];

                column.push(contribution.state_acronym || 'Outro/other');
                column.push(contribution.total_contributions);
                column.push([contribution.total_contributed, [//Adding row with custom comparator => read project-data-table description
                    m(`input[type="hidden"][value="${contribution.total_contributed}"`),
                    'R$ ',
                    h.formatNumber(contribution.total_contributed, 2, 3),
                    m('span.w-hidden-small.w-hidden-tiny', ' (' + contribution.total_on_percentage.toFixed(2) + '%)')
                ]]);
                return contributionsPerLocationTable.push(column);
            }) : [];
        };

        const lContributionsPerLocation = postgrest.loader(models.projectContributionsPerLocation.getRowOptions(filterStats.parameters()));
        lContributionsPerLocation.load().then(buildPerLocationTable);

        const lContributionsStats = postgrest.loader(models.projectContributionStat.getRowOptions(filterStats.parameters()));
        lContributionsStats.load().then(data => contributionsStats(_.first(data)));

        return {
            listVM: listVM,
            filterVM: filterVM,
            toggleWaiting: toggleWaiting,
            groupedCollection: groupedCollection,
            contributionsPerLocationTable: contributionsPerLocationTable,
            lContributionsPerLocation: lContributionsPerLocation,
            contributionsPerDay: contributionsPerDay,
            lContributionsPerDay: lContributionsPerDay,
            contributionsStats: contributionsStats
        };
    },
    view(ctrl, args) {
        const list = ctrl.listVM,
            stats = ctrl.contributionsStats(),
            groupedCollection = ctrl.groupedCollection(list.collection());

        return m('#project_contributions', m('#contributions_top', [
                m('.section.w-section',
                    m('.w-container',
                        m('.w-row', !_.isEmpty(stats) ? [
                            m('.u-marginbottom-20.u-text-center-small-only.w-col.w-col-6', [
                                m('.fontsize-megajumbo',
                                    stats.total
                                ),
                                m('.fontsize-large',
                                    'pessoas apoiam este projeto'
                                )
                            ]),
                            m('.w-col.w-col-6',
                                m('.card.card-terciary.u-radius',
                                    m('.w-row', [
                                        m('.u-marginbottom-20.w-col.w-col-6.w-col-small-6', [
                                            m('.fontweight-semibold.u-marginbottom-10',
                                                'Apoiadores novos'
                                            ),
                                            m('.fontsize-largest.u-marginbottom-10',
                                                `${Math.floor(stats.new_percent)}%`
                                            ),
                                            m('.fontsize-smallest',
                                                'apoiadores que nunca tinham apoiado um projeto no Catarse'
                                            )
                                        ]),
                                        m('.w-col.w-col-6.w-col-small-6', [
                                            m('.divider.u-marginbottom-20.w-hidden-main.w-hidden-medium.w-hidden-small'),
                                            m('.fontweight-semibold.u-marginbottom-10',
                                                'Apoiadores recorrentes'
                                            ),
                                            m('.fontsize-largest.u-marginbottom-10',
                                                `${Math.ceil(stats.returning_percent)}%`
                                            ),
                                            m('.fontsize-smallest',
                                                'apoiadores que já tinham apoiado um projeto no Catarse'
                                            )
                                        ])
                                    ])
                                )
                            )
                        ] : '')
                    )
                ),
                m('.divider.w-section'),
                m('.section.w-section', m('.w-container', [
                    m('.fontsize-large.fontweight-semibold.u-marginbottom-40.u-text-center', 'Apoiadores'),
                    (args.project().is_owner_or_admin ?
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-1', [
                                m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
                                    onclick: ctrl.toggleWaiting()
                                })
                            ]),
                            m('.w-col.w-col-5', [
                                m('label[for="contribution_state_available_to_count"]', 'Confirmados')
                            ]),
                            m('.w-col.w-col-1', [
                                m('input[id="contribution_state_waiting_confirmation"][type="radio"][name="waiting_payment"][value="waiting_confirmation"]', {
                                    onclick: ctrl.toggleWaiting(true)
                                })
                            ]),
                            m('.w-col.w-col-5', [
                                m('label[for="contribution_state_waiting_confirmation"]', 'Pendentes')
                            ])
                        ]) : ''),
                    m('.project-contributions.w-clearfix', _.map(groupedCollection, (group, idx) => m('.w-row', _.map(group, (contribution) => {
                        return m('.project-contribution-item.w-col.w-col-4', [
                            m('.w-row.u-marginbottom-30', [
                                m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3', [
                                    m('a[href="/users/' + contribution.user_id + '"]', {
                                        onclick: h.analytics.event({
                                            cat: 'project_view',
                                            act: 'project_backer_link',
                                            lbl: contribution.user_id,
                                            project: args.project()
                                        })
                                    }, [
                                        m('.thumb.u-round[style="background-image: url(' + (!_.isEmpty(contribution.profile_img_thumbnail) ? contribution.profile_img_thumbnail : '/assets/catarse_bootstrap/user.jpg') + '); background-size: contain;"]')
                                    ])
                                ]),
                                m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9', [
                                    m('.fontsize-base.fontweight-semibold', [
                                        m('a.fontsize-base.fontweight-semibold.link-hidden-dark[href="/users/' + contribution.user_id + '"]', {
                                            onclick: h.analytics.event({
                                                cat: 'project_view',
                                                act: 'project_backer_link',
                                                lbl: contribution.user_id,
                                                project: args.project()
                                            })
                                        }, contribution.user_name), (contribution.is_owner_or_admin ?
                                            m('.fontsize-smallest.fontweight-semibold', [
                                                'R$ ' + h.formatNumber(contribution.value, 2, 3), (contribution.anonymous ? [m.trust('&nbsp;-&nbsp;'), m('strong', 'Apoiador anônimo')] : '')
                                            ]) : ''),
                                        m('.fontsize-smallest.fontweight-semibold', h.momentify(contribution.created_at, 'DD/MM/YYYY, HH:mm') + 'h'),
                                        m('.fontsize-smallest.fontweight-semibold', (contribution.total_contributed_projects > 1 ? 'Apoiou este e mais outros ' + contribution.total_contributed_projects + ' projetos' : 'Apoiou somente este projeto até agora'))
                                    ])
                                ])
                            ])
                        ]);
                    })))),
                    m('.w-row.u-marginbottom-40.u-margintop-20', [
                        m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ?
                            list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                onclick: list.nextPage
                            }, 'Carregar mais') : h.loader(),
                        ])
                    ])
                ]))
            ]),
            m('.before-footer.bg-gray.section.w-section', m('.w-container', [
                m('.w-row.u-marginbottom-60', [
                    m('.w-col.w-col-12.u-text-center', {
                        style: {
                            'min-height': '300px'
                        }
                    }, [!ctrl.lContributionsPerDay() ? m.component(projectDataChart, {
                        collection: ctrl.contributionsPerDay,
                        label: 'R$ arrecadados por dia',
                        dataKey: 'total_amount',
                        xAxis: (item) => h.momentify(item.paid_at),
                        emptyState: 'Apoios não contabilizados'
                    }) : h.loader()]),
                ]),
                m('.w-row',
                    m('.w-col.w-col-12.u-text-center', [
                        m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'De onde vem os principais apoios'),
                        (!ctrl.lContributionsPerLocation() ? !_.isEmpty(_.rest(ctrl.contributionsPerLocationTable)) ? m.component(projectDataTable, {
                            table: ctrl.contributionsPerLocationTable,
                            defaultSortIndex: -2
                        }) : '' : h.loader())
                    ])
                )
            ])));
    }
};

export default projectContributions;
